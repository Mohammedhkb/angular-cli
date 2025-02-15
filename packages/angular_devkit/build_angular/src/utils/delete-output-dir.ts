/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { readdir, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';

/**
 * Delete an output directory, but error out if it's the root of the project.
 */
export async function deleteOutputDir(root: string, outputPath: string): Promise<void> {
  const resolvedOutputPath = resolve(root, outputPath);
  if (resolvedOutputPath === root) {
    throw new Error('Output path MUST not be project root directory!');
  }

  // Avoid removing the actual directory to avoid errors in cases where the output
  // directory is mounted or symlinked. Instead the contents are removed.
  let entries;
  try {
    entries = await readdir(resolvedOutputPath);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return;
    }
    throw error;
  }

  for (const entry of entries) {
    await rm(join(resolvedOutputPath, entry), { force: true, recursive: true, maxRetries: 3 });
  }
}
