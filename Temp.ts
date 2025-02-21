import { SfdxCommand } from '@salesforce/command';
import { Messages, SfdxError } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('data-upsert-plugin', 'upsertdata');

export default class UpsertData extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');
  public static examples = [
    `$ sfdx myplugin:upsertdata --folder ./csv-files --mapping ./mapping.json`,
  ];

  protected static flagsConfig = {
    folder: {
      char: 'f',
      description: messages.getMessage('folderFlagDescription'),
      required: true,
      type: 'string',
    },
    mapping: {
      char: 'm',
      description: messages.getMessage('mappingFlagDescription'),
      required: true,
      type: 'string',
    },
  };

  protected static requiresUsername = true;

  public async run(): Promise<AnyJson> {
    const folder = this.flags.folder as string;
    const mappingFile = this.flags.mapping as string;

    // Read the mapping JSON file
    let mapping: { [key: string]: string };
    try {
      mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));
    } catch (err) {
      throw new SfdxError(`Failed to read or parse mapping file: ${err.message}`);
    }

    // Read all CSV files in the folder
    const files = fs.readdirSync(folder).filter((file) => file.endsWith('.csv'));

    // Parse file names to extract object and priority
    const fileList = files
      .map((file) => {
        const match = file.match(/^(.*)_(\d+)\.csv$/);
        if (match) {
          const object = match[1];
          const priority = parseInt(match[2], 10);
          return { file, object, priority };
        }
        return null;
      })
      .filter((item) => item !== null);

    // Sort files by priority
    fileList.sort((a, b) => a.priority - b.priority);

    // Process each file in order
    for (const item of fileList) {
      const object = item.object;
      const filePath = path.join(folder, item.file);
      const externalId = mapping[object];

      if (!externalId) {
        throw new SfdxError(`No external ID mapping found for object ${object}`);
      }

      const command = `sfdx force:data:bulk:upsert -s ${object} -f ${filePath} -i ${externalId} -w 10`;
      this.ux.log(`Executing: ${command}`);

      try {
        execSync(command, { stdio: 'inherit' });
        this.ux.log(`Successfully upserted data from ${item.file}`);
      } catch (err) {
        throw new SfdxError(`Failed to upsert data from ${item.file}: ${err.message}`);
      }
    }

    return { status: 'success', filesProcessed: fileList.map((item) => item.file) };
  }
}
