const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const crypto = require("crypto");

const PORT = process.env.PORT || 4000;
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "leagues.json");

function ensureDataFile() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ leagues: [] }, null, 2), "utf8");
    }
}

function readDb() {
    ensureDataFile();
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeDb(data) {
    ensureDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

function sendJson(response, statusCode, payload) {
    response.writeHead(statusCode, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, x-admin-token"
    });
    response.end(JSON.stringify(payload));
}

function sendCsv(response, filename, rows) {
    response.writeHead(200, {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Access-Control-Allow-Origin": "*"
    });
    response.end(rows.map(toCsvRow).join("\n"));
}

function toCsvValue(value) {
    const safeValue = value ?? "";
    const stringValue = String(safeValue).replace(/"/g, '""');
    return `"${stringValue}"`;
}

function toCsvRow(columns) {
    return columns.map(toCsvValue).join(",");
}

function readBody(request) {
    return new Promise((resolve, reject) => {
        let body = "";

        request.on("data", (chunk) => {
            body += chunk.toString();
        });

        request.on("end", () => {
            if (!body) {
                resolve({});
                return;
            }

            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(new Error("Invalid JSON payload."));
            }
        });

        request.on("error", reject);
    });
}

function createToken() {
    return crypto.randomBytes(24).toString("hex");
}

function hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
}

function toPublicLeague(league) {
    const teams = (league.teams || []).map((team) => {
        const selectedPlayers = (team.selectedPlayerIds || [])
            .map((playerId) => league.players.find((player) => player.id === playerId))
            .filter(Boolean);
        const totalPoints = selectedPlayers.reduce(
            (sum, player) => sum + Number(player.points || 0),
            0
        );

        return {
            ...team,
            selectedPlayers,
            totalPoints
        };
    });

    const standings = [...teams]
        .sort((left, right) => {
            if (right.totalPoints !== left.totalPoints) {
                return right.totalPoints - left.totalPoints;
            }

            return left.teamName.localeCompare(right.teamName);
        })
        .map((team, index) => ({
            rank: index + 1,
            teamId: team.id,
            teamName: team.teamName,
            managerName: team.managerName,
            totalPoints: team.totalPoints
        }));

    return {
        id: league.id,
        code: league.code,
        name: league.name,
        adminName: league.adminName,
        description: league.description,
        teamSize: league.teamSize,
        createdAt: league.createdAt,
        googleSheetsUrl: league.googleSheetsUrl || "",
        players: league.players,
        teams,
        standings
    };
}

function buildSheetPayload(league) {
    const normalizedLeague = toPublicLeague(league);

    return {
        league: {
            id: normalizedLeague.id,
            code: normalizedLeague.code,
            name: normalizedLeague.name,
            adminName: normalizedLeague.adminName,
            description: normalizedLeague.description,
            teamSize: normalizedLeague.teamSize,
            createdAt: normalizedLeague.createdAt
        },
        sheets: {
            standings: [
                ["Rank", "Team", "Manager", "Total Points"],
                ...normalizedLeague.standings.map((standing) => [
                    standing.rank,
                    standing.teamName,
                    standing.managerName,
                    standing.totalPoints
                ])
            ],
            teams: [
                ["Team", "Manager", "Players", "Total Points"],
                ...normalizedLeague.teams.map((team) => [
                    team.teamName,
                    team.managerName,
                    team.selectedPlayers.map((player) => `${player.name} (${player.position})`).join(" | "),
                    team.totalPoints
                ])
            ],
            players: [
                ["Player", "Position", "Points"],
                ...normalizedLeague.players.map((player) => [
                    player.name,
                    player.position,
                    player.points
                ])
            ]
        }
    };
}

function validateLeaguePayload(payload) {
    const name = payload.name?.trim();
    const adminName = payload.adminName?.trim();
    const adminPassword = payload.adminPassword?.trim();
    const description = payload.description?.trim() || "";
    const googleSheetsUrl = payload.googleSheetsUrl?.trim() || "";
    const teamSize = Number(payload.teamSize);
    const players = Array.isArray(payload.players) ? payload.players : [];

    if (!name) {
        return { error: "League name is required." };
    }

    if (!adminName) {
        return { error: "Admin name is required." };
    }

    if (!adminPassword || adminPassword.length < 4) {
        return { error: "Admin password must be at least 4 characters." };
    }

    if (!Number.isInteger(teamSize) || teamSize < 1) {
        return { error: "Players per team must be at least 1." };
    }

    if (players.length < teamSize) {
        return { error: "Player pool must be at least the team size." };
    }

    const normalizedPlayers = players.map((player, index) => ({
        id: crypto.randomUUID(),
        name: player.name?.trim(),
        position: player.position?.trim() || "MID",
        points: Number(player.points || 0),
        order: index + 1
    }));

    const invalidPlayer = normalizedPlayers.find(
        (player) => !player.name || Number.isNaN(player.points)
    );

    if (invalidPlayer) {
        return { error: "Each player needs a name and a valid points value." };
    }

    const adminToken = createToken();

    return {
        league: {
            id: crypto.randomUUID(),
            code: crypto.randomBytes(3).toString("hex").toUpperCase(),
            name,
            adminName,
            description,
            teamSize,
            createdAt: new Date().toISOString(),
            googleSheetsUrl,
            players: normalizedPlayers,
            teams: [],
            adminPasswordHash: hashPassword(adminPassword),
            adminSessionToken: adminToken
        },
        adminToken
    };
}

function validateTeamPayload(league, payload, teamId = null) {
    const managerName = payload.managerName?.trim();
    const teamName = payload.teamName?.trim();
    const selectedPlayerIds = Array.isArray(payload.selectedPlayerIds)
        ? payload.selectedPlayerIds
        : [];

    if (!managerName) {
        return { error: "Manager name is required." };
    }

    if (!teamName) {
        return { error: "Team name is required." };
    }

    if (selectedPlayerIds.length !== league.teamSize) {
        return { error: `Select exactly ${league.teamSize} players.` };
    }

    const uniqueIds = new Set(selectedPlayerIds);
    if (uniqueIds.size !== selectedPlayerIds.length) {
        return { error: "A player can only be selected once per team." };
    }

    const hasMissingPlayer = selectedPlayerIds.some(
        (playerId) => !league.players.find((player) => player.id === playerId)
    );

    if (hasMissingPlayer) {
        return { error: "One or more selected players do not exist in this league." };
    }

    const duplicateTeamName = league.teams.find(
        (team) =>
            team.id !== teamId &&
            team.teamName.toLowerCase() === teamName.toLowerCase()
    );

    if (duplicateTeamName) {
        return { error: "Team name already exists in this league." };
    }

    const duplicateManager = league.teams.find(
        (team) =>
            team.id !== teamId &&
            team.managerName.toLowerCase() === managerName.toLowerCase()
    );

    if (duplicateManager) {
        return { error: "This manager has already submitted a team." };
    }

    return {
        team: {
            id: teamId || crypto.randomUUID(),
            managerName,
            teamName,
            selectedPlayerIds,
            createdAt: new Date().toISOString()
        }
    };
}

function findLeagueOrNull(db, predicate) {
    return db.leagues.find(predicate) || null;
}

function getLeagueById(db, leagueId) {
    return findLeagueOrNull(db, (league) => league.id === leagueId);
}

function requireAdminToken(request, response, league) {
    const token = request.headers["x-admin-token"];

    if (!token || token !== league.adminSessionToken) {
        sendJson(response, 401, { message: "Admin authentication required." });
        return false;
    }

    return true;
}

function routeNotFound(response) {
    sendJson(response, 404, { message: "Route not found." });
}

async function syncLeagueToGoogleSheets(league) {
    if (!league.googleSheetsUrl) {
        throw new Error("Google Sheets webhook URL is not configured for this league.");
    }

    const payload = buildSheetPayload(league);
    const syncResponse = await fetch(league.googleSheetsUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    const text = await syncResponse.text();

    if (!syncResponse.ok) {
        throw new Error(text || "Google Sheets sync failed.");
    }

    return text || "Google Sheets sync completed.";
}

const server = http.createServer(async (request, response) => {
    if (request.method === "OPTIONS") {
        response.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, x-admin-token"
        });
        response.end();
        return;
    }

    const url = new URL(request.url, `http://${request.headers.host}`);
    const db = readDb();

    try {
        if (request.method === "GET" && url.pathname === "/api/health") {
            sendJson(response, 200, { ok: true });
            return;
        }

        if (request.method === "GET" && url.pathname === "/api/leagues") {
            const leagues = db.leagues
                .map(toPublicLeague)
                .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

            sendJson(response, 200, { leagues });
            return;
        }

        if (request.method === "POST" && url.pathname === "/api/leagues") {
            const payload = await readBody(request);
            const validation = validateLeaguePayload(payload);

            if (validation.error) {
                sendJson(response, 400, { message: validation.error });
                return;
            }

            db.leagues.unshift(validation.league);
            writeDb(db);
            sendJson(response, 201, {
                league: toPublicLeague(validation.league),
                adminToken: validation.adminToken
            });
            return;
        }

        if (request.method === "POST" && /^\/api\/leagues\/[^/]+\/admin-login$/.test(url.pathname)) {
            const leagueId = url.pathname.split("/")[3];
            const league = getLeagueById(db, leagueId);

            if (!league) {
                sendJson(response, 404, { message: "League not found." });
                return;
            }

            const payload = await readBody(request);
            const password = payload.password?.trim();

            if (!password || hashPassword(password) !== league.adminPasswordHash) {
                sendJson(response, 401, { message: "Invalid admin password." });
                return;
            }

            league.adminSessionToken = createToken();
            writeDb(db);
            sendJson(response, 200, {
                league: toPublicLeague(league),
                adminToken: league.adminSessionToken
            });
            return;
        }

        if (request.method === "GET" && url.pathname.startsWith("/api/leagues/code/")) {
            const code = decodeURIComponent(url.pathname.split("/").pop()).toUpperCase();
            const league = findLeagueOrNull(db, (item) => item.code === code);

            if (!league) {
                sendJson(response, 404, { message: "League code not found." });
                return;
            }

            sendJson(response, 200, { league: toPublicLeague(league) });
            return;
        }

        if (request.method === "GET" && /^\/api\/leagues\/[^/]+$/.test(url.pathname)) {
            const leagueId = url.pathname.split("/")[3];
            const league = getLeagueById(db, leagueId);

            if (!league) {
                sendJson(response, 404, { message: "League not found." });
                return;
            }

            sendJson(response, 200, { league: toPublicLeague(league) });
            return;
        }

        if (request.method === "POST" && /^\/api\/leagues\/[^/]+\/teams$/.test(url.pathname)) {
            const leagueId = url.pathname.split("/")[3];
            const league = getLeagueById(db, leagueId);

            if (!league) {
                sendJson(response, 404, { message: "League not found." });
                return;
            }

            const payload = await readBody(request);
            const validation = validateTeamPayload(league, payload);

            if (validation.error) {
                sendJson(response, 400, { message: validation.error });
                return;
            }

            league.teams.push(validation.team);
            writeDb(db);
            sendJson(response, 201, { league: toPublicLeague(league) });
            return;
        }

        if (request.method === "PATCH" && /^\/api\/leagues\/[^/]+\/teams\/[^/]+$/.test(url.pathname)) {
            const [, , , leagueId, , teamId] = url.pathname.split("/");
            const league = getLeagueById(db, leagueId);

            if (!league) {
                sendJson(response, 404, { message: "League not found." });
                return;
            }

            if (!requireAdminToken(request, response, league)) {
                return;
            }

            const existingTeam = league.teams.find((team) => team.id === teamId);

            if (!existingTeam) {
                sendJson(response, 404, { message: "Team not found." });
                return;
            }

            const payload = await readBody(request);
            const validation = validateTeamPayload(league, payload, teamId);

            if (validation.error) {
                sendJson(response, 400, { message: validation.error });
                return;
            }

            Object.assign(existingTeam, validation.team, {
                createdAt: existingTeam.createdAt,
                updatedAt: new Date().toISOString()
            });
            writeDb(db);
            sendJson(response, 200, { league: toPublicLeague(league) });
            return;
        }

        if (request.method === "DELETE" && /^\/api\/leagues\/[^/]+\/teams\/[^/]+$/.test(url.pathname)) {
            const [, , , leagueId, , teamId] = url.pathname.split("/");
            const league = getLeagueById(db, leagueId);

            if (!league) {
                sendJson(response, 404, { message: "League not found." });
                return;
            }

            if (!requireAdminToken(request, response, league)) {
                return;
            }

            const originalLength = league.teams.length;
            league.teams = league.teams.filter((team) => team.id !== teamId);

            if (league.teams.length === originalLength) {
                sendJson(response, 404, { message: "Team not found." });
                return;
            }

            writeDb(db);
            sendJson(response, 200, { league: toPublicLeague(league) });
            return;
        }

        if (request.method === "PATCH" && /^\/api\/leagues\/[^/]+\/players\/[^/]+$/.test(url.pathname)) {
            const [, , , leagueId, , playerId] = url.pathname.split("/");
            const league = getLeagueById(db, leagueId);

            if (!league) {
                sendJson(response, 404, { message: "League not found." });
                return;
            }

            if (!requireAdminToken(request, response, league)) {
                return;
            }

            const player = league.players.find((item) => item.id === playerId);

            if (!player) {
                sendJson(response, 404, { message: "Player not found." });
                return;
            }

            const payload = await readBody(request);
            const name = payload.name?.trim();
            const position = payload.position?.trim();
            const points = Number(payload.points);

            if (!name) {
                sendJson(response, 400, { message: "Player name is required." });
                return;
            }

            if (Number.isNaN(points)) {
                sendJson(response, 400, { message: "Points must be a valid number." });
                return;
            }

            player.name = name;
            player.position = position || player.position;
            player.points = points;
            writeDb(db);
            sendJson(response, 200, { league: toPublicLeague(league) });
            return;
        }

        if (request.method === "DELETE" && /^\/api\/leagues\/[^/]+\/players\/[^/]+$/.test(url.pathname)) {
            const [, , , leagueId, , playerId] = url.pathname.split("/");
            const league = getLeagueById(db, leagueId);

            if (!league) {
                sendJson(response, 404, { message: "League not found." });
                return;
            }

            if (!requireAdminToken(request, response, league)) {
                return;
            }

            const playerInUse = league.teams.some((team) =>
                team.selectedPlayerIds.includes(playerId)
            );

            if (playerInUse) {
                sendJson(response, 400, {
                    message: "Cannot delete a player who is already used in a submitted team."
                });
                return;
            }

            const originalLength = league.players.length;
            league.players = league.players.filter((player) => player.id !== playerId);

            if (league.players.length === originalLength) {
                sendJson(response, 404, { message: "Player not found." });
                return;
            }

            if (league.players.length < league.teamSize) {
                sendJson(response, 400, {
                    message: "Cannot delete this player because the player pool would become smaller than the team size."
                });
                return;
            }

            writeDb(db);
            sendJson(response, 200, { league: toPublicLeague(league) });
            return;
        }

        if (request.method === "PATCH" && /^\/api\/leagues\/[^/]+\/settings$/.test(url.pathname)) {
            const leagueId = url.pathname.split("/")[3];
            const league = getLeagueById(db, leagueId);

            if (!league) {
                sendJson(response, 404, { message: "League not found." });
                return;
            }

            if (!requireAdminToken(request, response, league)) {
                return;
            }

            const payload = await readBody(request);
            league.googleSheetsUrl = payload.googleSheetsUrl?.trim() || "";
            writeDb(db);
            sendJson(response, 200, { league: toPublicLeague(league) });
            return;
        }

        if (request.method === "POST" && /^\/api\/leagues\/[^/]+\/sync-google-sheets$/.test(url.pathname)) {
            const leagueId = url.pathname.split("/")[3];
            const league = getLeagueById(db, leagueId);

            if (!league) {
                sendJson(response, 404, { message: "League not found." });
                return;
            }

            if (!requireAdminToken(request, response, league)) {
                return;
            }

            const message = await syncLeagueToGoogleSheets(league);
            sendJson(response, 200, {
                message,
                league: toPublicLeague(league)
            });
            return;
        }

        if (
            request.method === "GET" &&
            /^\/api\/leagues\/[^/]+\/export\/(standings|teams|players)\.csv$/.test(url.pathname)
        ) {
            const parts = url.pathname.split("/");
            const leagueId = parts[3];
            const exportName = parts[5].replace(".csv", "");
            const league = getLeagueById(db, leagueId);

            if (!league) {
                sendJson(response, 404, { message: "League not found." });
                return;
            }

            const normalizedLeague = toPublicLeague(league);

            if (exportName === "standings") {
                const rows = [
                    ["Rank", "Team", "Manager", "Total Points"],
                    ...normalizedLeague.standings.map((standing) => [
                        standing.rank,
                        standing.teamName,
                        standing.managerName,
                        standing.totalPoints
                    ])
                ];
                sendCsv(response, `${league.code}-standings.csv`, rows);
                return;
            }

            if (exportName === "teams") {
                const rows = [
                    ["Team", "Manager", "Players", "Total Points"],
                    ...normalizedLeague.teams.map((team) => [
                        team.teamName,
                        team.managerName,
                        team.selectedPlayers.map((player) => `${player.name} (${player.position})`).join(" | "),
                        team.totalPoints
                    ])
                ];
                sendCsv(response, `${league.code}-teams.csv`, rows);
                return;
            }

            const rows = [
                ["Player", "Position", "Points"],
                ...normalizedLeague.players.map((player) => [
                    player.name,
                    player.position,
                    player.points
                ])
            ];
            sendCsv(response, `${league.code}-players.csv`, rows);
            return;
        }

        routeNotFound(response);
    } catch (error) {
        sendJson(response, 500, {
            message: error.message || "Unexpected server error."
        });
    }
});

ensureDataFile();
server.listen(PORT, () => {
    console.log(`Fantasy League API running on http://localhost:${PORT}`);
});
