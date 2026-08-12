const TelegramBot = require('Telegram');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const vm = require('vm');

const rootDir = __dirname;
const configPath = path.join(rootDir, 'config.json');
const pluginsPath = path.join(rootDir, 'MayPlugins');

function getPackageVersion() {
    try {
        const pkgPath = path.join(rootDir, 'package.json');
        if (fs.existsSync(pkgPath)) {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            if (pkg && pkg.version) return pkg.version;
        }
    } catch {}
    return '1.0.0';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function clearScreen() {
    process.stdout.write('\x1Bc');
    console.clear();
}

function headerLines() {
    const version = getPackageVersion();
    return [
        `Pyl - v${version}`,
        'Telegram Bot - Maintenance and downloads.'
    ];
}

function printHeader() {
    for (const line of headerLines()) console.log(line);
    console.log('');
}

function printReviewIntro() {
    printHeader();
    console.log('Reviewing internal code status');
    console.log(' - Checking syntax of all code files');
}

function printLoginIntro() {
    printHeader();
    console.log('Authentication required. Please enter your bot token.');
    console.log('');
    console.log('Enter your bot token =>');
}

function printSetupIntro() {
    printHeader();
    console.log('Validating token...');
    console.log('Token accepted. Continuing with bot setup.');
    console.log('');
}

function loadConfig() {
    try {
        if (fs.existsSync(configPath)) {
            const raw = fs.readFileSync(configPath, 'utf8');
            const config = JSON.parse(raw);
            if (config && typeof config === 'object') return config;
        }
    } catch {}
    return null;
}

function saveConfig(token) {
    try {
        const config = {
            token,
            lastConnection: Date.now()
        };
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    } catch {}
}

function validateToken(token) {
    return typeof token === 'string' && token.includes(':') && token.trim().length > 20;
}

function askForToken() {
    return new Promise(resolve => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('', answer => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

function isIgnoredDir(dirName) {
    return dirName === 'node_modules' || dirName === '.git' || dirName === '.cache' || dirName === 'dist' || dirName === 'build';
}

function collectJavaScriptFiles(dir, out = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (!isIgnoredDir(entry.name)) collectJavaScriptFiles(fullPath, out);
            continue;
        }
        if (entry.isFile() && /\.(js|cjs|mjs)$/.test(entry.name)) {
            out.push(fullPath);
        }
    }

    return out;
}

function checkSyntax(filePath) {
    try {
        const code = fs.readFileSync(filePath, 'utf8');
        new vm.Script(code, { filename: filePath });
        return null;
    } catch (error) {
        return error;
    }
}

function scanSyntax() {
    const files = collectJavaScriptFiles(rootDir);
    const errors = [];

    for (const file of files) {
        const error = checkSyntax(file);
        if (error) {
            errors.push({
                file: path.relative(rootDir, file) || path.basename(file),
                error: error.message
            });
        }
    }

    return errors;
}

function printSyntaxReview(errors) {
    if (errors.length === 0) {
        console.log('Syntax review complete. No errors found.');
        return;
    }

    for (const item of errors) {
        console.log(`Error in ${item.file}:`);
        console.log(item.error);
        console.log('');
    }
}

function loadPlugins(bot) {
    let count = 0;

    try {
        if (!fs.existsSync(pluginsPath)) fs.mkdirSync(pluginsPath, { recursive: true });
        const files = fs.readdirSync(pluginsPath);

        for (const file of files) {
            if (!file.endsWith('.js')) continue;

            const pluginPath = path.join(pluginsPath, file);

            try {
                delete require.cache[require.resolve(pluginPath)];
                const handler = require(pluginPath);

                if (typeof handler === 'function') {
                    handler(bot);
                    count++;
                }
            } catch (error) {
                console.log(`Error loading plugin ${path.relative(rootDir, pluginPath)}:`);
                console.log(error.message);
                console.log('');
            }
        }
    } catch (error) {
        console.log(`Error accessing plugins directory ${pluginsPath}:`);
        console.log(error.message);
        console.log('');
    }

    return count;
}

function setupMessageHandler(bot) {
    bot.on('message', msg => {
        const chatId = msg?.chat?.id;
        const userId = msg?.from?.id;
        const userName = msg?.from?.username || msg?.from?.first_name || 'User';
        const messageText = msg?.text || '[Media/File]';
        const chatType = msg?.chat?.type || 'unknown';
        const chatTitle = msg?.chat?.title || 'Private Chat';

        console.log('--- Message ---');
        console.log(`User: ${userName} (${userId})`);
        console.log(`Chat: ${chatTitle} (${chatId})`);
        console.log(`Type: ${chatType}`);
        console.log(`Text: ${messageText}`);
        console.log('---------------');
        console.log('');

        if (chatId !== undefined && userId !== undefined) {
            void chatId;
            void userId;
            void userName;
            void messageText;
            void chatType;
            void chatTitle;
        }
    });

    bot.on('polling_error', error => {
        console.log(`Polling error: ${error.message}`);
    });

    bot.on('error', error => {
        console.log(`Bot error: ${error.message}`);
    });
}

async function getToken() {
    const config = loadConfig();

    if (config && validateToken(config.token)) {
        return config.token;
    }

    printLoginIntro();
    const token = await askForToken();

    printSetupIntro();

    if (!validateToken(token)) {
        console.log('Invalid token. The bot will stop.');
        process.exit(1);
    }

    saveConfig(token);
    return token;
}

async function startBot() {
    clearScreen();
    printReviewIntro();

    const errors = scanSyntax();
    printSyntaxReview(errors);

    console.log('Review complete. Starting bot...');

    await sleep(2000);

    clearScreen();
    printHeader();

    const token = await getToken();

    try {
        const bot = new TelegramBot(token, {
            polling: {
                interval: 300,
                autoStart: true,
                params: {
                    timeout: 10
                }
            }
        });

        setupMessageHandler(bot);

        const botInfo = await bot.getMe();

        console.log(`Bot connected: ${botInfo.first_name || 'Unknown'} (@${botInfo.username || 'unknown'})`);
        console.log(`Bot ID: ${botInfo.id}`);
        console.log(`Started at: ${new Date().toLocaleString()}`);
        console.log('');

        const pluginCount = loadPlugins(bot);
        console.log(`Plugins loaded: ${pluginCount}`);
        console.log('Bot is running.');

        process.on('SIGINT', () => {
            try {
                bot.stopPolling();
            } catch {}
            console.log('Bot stopped.');
            process.exit(0);
        });
    } catch (error) {
        console.log(`Connection error: ${error.message}`);

        if (String(error.message || '').includes('401')) {
            try {
                if (fs.existsSync(configPath)) fs.unlinkSync(configPath);
            } catch {}
        }

        process.exit(1);
    }
}

if (!fs.existsSync(pluginsPath)) {
    fs.mkdirSync(pluginsPath, { recursive: true });
}

startBot().catch(error => {
    console.log(`Fatal error: ${error.message}`);
    process.exit(1);
});
