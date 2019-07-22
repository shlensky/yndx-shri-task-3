import { readFileSync, readFile } from 'fs';
import { join, resolve, basename } from 'path';
import { bemhtml } from 'bem-xjst';

import * as vscode from 'vscode';
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind,
    SettingMonitor
} from 'vscode-languageclient';

const previewPath: string = resolve(__dirname, '../preview/index.html');
const previewHtml: string = readFileSync(previewPath).toString();
const template = bemhtml.compile();
const linterEnableSetting = 'example.enable';

let client: LanguageClient;
const PANELS: Record<string, vscode.WebviewPanel> = {};

const createLanguageClient = (context: vscode.ExtensionContext): LanguageClient => {
    const serverModulePath = context.asAbsolutePath(join('out', 'server.js'));

    const serverOptions: ServerOptions = {
        run: {
            module: serverModulePath,
            transport: TransportKind.ipc
        },
        debug: {
            module: serverModulePath,
            transport: TransportKind.ipc,
            options: { execArgv: ['--nolazy', '--inspect=6009'] }
        }
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [
            {
                scheme: 'file',
                language: 'json'
            }
        ],
        synchronize: {
            configurationSection: 'example'
        }
    };

    client = new LanguageClient(
        'languageServerExample',
        'Language Server Example',
        serverOptions,
        clientOptions
    );

    return client;
};

const setPreviewContent = (doc: vscode.TextDocument, context: vscode.ExtensionContext) => {
    const panel = PANELS[doc.uri.path];

    if (panel) {
        const mediaPath = vscode.Uri.file(context.extensionPath).with({
            scheme: 'vscode-resource'
        }).toString();

        try {
            const json = doc.getText();
            const data = JSON.parse(json);
            const html = template.apply(data);
            panel.webview.html = previewHtml
                .replace('{{content}}', html)
                .replace(new RegExp('{{mediaPath}}', 'g'), mediaPath);
        } catch(e) {}
    }
};

const initPreviewPanel = (document: vscode.TextDocument) => {
    const fileName = basename(document.fileName);

    const panel = vscode.window.createWebviewPanel(
        'example.preview',
        `Preview: ${fileName}`,
        vscode.ViewColumn.Beside,
        {
            enableScripts: true
        }
    );

    PANELS[document.uri.path] = panel;

    panel.onDidDispose(() => {
        delete PANELS[document.uri.path];
    });

    return panel;
};

const openPreview = (context: vscode.ExtensionContext) => {
    const editor = vscode.window.activeTextEditor;

    if (editor !== undefined) {
        const document: vscode.TextDocument = editor.document;

        const path = document.uri.toString();
        const panel = PANELS[path];

        if (panel) {
            panel.reveal();
        } else {
            const panel = initPreviewPanel(document);
            setPreviewContent(document, context);
            context.subscriptions.push(panel);
        }
    }
};

export function activate(context: vscode.ExtensionContext) {

    console.info('Congratulations, your extension is now active!');

    client = createLanguageClient(context);
    if (vscode.workspace.getConfiguration().get(linterEnableSetting)) {
        client.start();
    }

    const eventConfigurationChange = vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
        if (e.affectsConfiguration(linterEnableSetting)) {
            if (vscode.workspace.getConfiguration().get(linterEnableSetting)) {
                console.info('Starting language client');
                client.start();
            } else {
                console.info('Stopping language client');
                client.stop();
            }
        }
    });

    const eventChange: vscode.Disposable = vscode.workspace
        .onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => setPreviewContent(e.document, context));

    const previewCommand = vscode.commands.registerCommand('example.showPreviewToSide', () => openPreview(context));

    context.subscriptions.push(previewCommand, eventChange, eventConfigurationChange);
}

export function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
