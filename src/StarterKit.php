<?php

namespace Drupal\brainsum_starterkit;

use Drupal\Core\Theme\StarterKitInterface;

/**
 * Starterkit Class.
 */
final class StarterKit implements StarterKitInterface {

  /**
   * {@inheritdoc}
   */
  public static function postProcess(string $working_dir, string $machine_name, string $theme_name): void {
    $readme_file = "$working_dir/README.md";
    try {
      file_put_contents($readme_file, "$theme_name theme, generated from starterkit_theme. Additional information on generating themes can be found in the [Starterkit documentation](https://www.drupal.org/docs/core-modules-and-themes/core-themes/starterkit-theme).");
    }
    catch (\Throwable $th) {
    }

    // Copy DDEV configuration files to the project root.
    static::installDdevConfig($working_dir);
  }

  /**
   * Copy DDEV config files from the theme's _ddev/ dir to the project root.
   *
   * postProcess() receives a temp directory, not the final theme path.
   * We use DDEV_APPROOT to find the project root when running inside DDEV.
   * If not in DDEV, the _ddev/ directory is kept for manual installation.
   *
   * @param string $working_dir
   *   The generated theme directory (may be a temp path).
   */
  private static function installDdevConfig(string $working_dir): void {
    $source_dir = $working_dir . '/_ddev';
    if (!is_dir($source_dir)) {
      return;
    }

    $project_root = static::findDdevProjectRoot();
    if ($project_root === NULL) {
      // Not running inside DDEV — keep _ddev/ in the theme for manual setup.
      echo "  [ddev] Not running inside DDEV. The _ddev/ directory is kept\n";
      echo "         in your theme — copy its contents to .ddev/ manually.\n";
      return;
    }

    echo "  [ddev] Installing DDEV configuration...\n";
    $ddev_dir = $project_root . '/.ddev';
    $file_map = [
      'browser-sync.cjs' => 'browser-sync.cjs',
      'config.browsersync.yaml' => 'config.browsersync.yaml',
      'commands/host/dev' => 'commands/host/dev',
      'commands/host/build' => 'commands/host/build',
    ];

    foreach ($file_map as $src => $dest) {
      $src_path = $source_dir . '/' . $src;
      $dest_path = $ddev_dir . '/' . $dest;

      if (!file_exists($src_path)) {
        continue;
      }

      // Overwrite files that contain #ddev-generated (addon defaults).
      // Skip files that were manually customized by the user.
      if (file_exists($dest_path)) {
        $contents = file_get_contents($dest_path);
        if ($contents !== FALSE && str_contains($contents, '#ddev-generated')) {
          // Safe to overwrite — it's an auto-generated default.
        }
        else {
          echo "  [skip] .ddev/$dest already customized.\n";
          continue;
        }
      }

      $dest_dir = dirname($dest_path);
      if (!is_dir($dest_dir)) {
        if (!mkdir($dest_dir, 0755, TRUE)) {
          echo "  [error] Could not create directory: .ddev/" . dirname($dest) . "\n";
          continue;
        }
      }

      if (!copy($src_path, $dest_path)) {
        echo "  [error] Could not copy .ddev/$dest\n";
        continue;
      }

      // Make command scripts executable.
      if (str_starts_with($dest, 'commands/')) {
        chmod($dest_path, 0755);
      }

      echo "  [ok] .ddev/$dest\n";
    }

    // Generate config.nodejs.yaml from .nvmrc.
    static::installNodeConfig($working_dir, $ddev_dir);

    // Clean up _ddev/ so it doesn't end up in the generated theme.
    static::removeDirectory($source_dir);
    echo "  [ddev] Done.\n";
  }

  /**
   * Generate .ddev/config.nodejs.yaml from the theme's .nvmrc file.
   *
   * @param string $working_dir
   *   The generated theme directory.
   * @param string $ddev_dir
   *   The .ddev directory path.
   */
  private static function installNodeConfig(string $working_dir, string $ddev_dir): void {
    $nvmrc = $working_dir . '/.nvmrc';
    if (!file_exists($nvmrc)) {
      return;
    }

    $version = trim(file_get_contents($nvmrc));
    if ($version === '') {
      return;
    }

    $dest_path = $ddev_dir . '/config.nodejs.yaml';
    if (file_exists($dest_path)) {
      echo "  [skip] .ddev/config.nodejs.yaml already exists.\n";
      return;
    }

    $yaml = "# Generated from .nvmrc — update .nvmrc and regenerate to change.\n";
    $yaml .= "nodejs_version: \"$version\"\n";
    $yaml .= "corepack_enable: true\n";

    if (file_put_contents($dest_path, $yaml) !== FALSE) {
      echo "  [ok] .ddev/config.nodejs.yaml (node $version from .nvmrc)\n";
    }
    else {
      echo "  [error] Could not write .ddev/config.nodejs.yaml\n";
    }
  }

  /**
   * Find the DDEV project root.
   *
   * Uses the DDEV_APPROOT environment variable when running inside DDEV.
   *
   * @return string|null
   *   The project root path, or NULL if not in a DDEV environment.
   */
  private static function findDdevProjectRoot(): ?string {
    $root = getenv('DDEV_APPROOT');
    if ($root !== FALSE && is_dir($root . '/.ddev')) {
      return $root;
    }
    return NULL;
  }

  /**
   * Recursively remove a directory.
   *
   * @param string $dir
   *   The directory path to remove.
   */
  private static function removeDirectory(string $dir): void {
    if (!is_dir($dir)) {
      return;
    }
    $items = new \RecursiveIteratorIterator(
      new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS),
      \RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($items as $item) {
      if ($item->isDir()) {
        rmdir($item->getPathname());
      }
      else {
        unlink($item->getPathname());
      }
    }
    rmdir($dir);
  }

}
