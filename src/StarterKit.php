<?php

namespace Drupal\brainsum_starterkit;

use Drupal\Component\Serialization\Yaml;
use Drupal\Core\Theme\StarterKitInterface;

final class StarterKit implements StarterKitInterface {

  /**
   * {@inheritdoc}
   */
  public static function postProcess(string $working_dir, string $machine_name, string $theme_name): void {
    $info_file = "$working_dir/$machine_name.info.yml";
    $info = Yaml::decode(file_get_contents($info_file));
    // Unhide hidden themes, and remove the starterkit flag.
    unset($info['hidden'], $info['starterkit']);
    file_put_contents($info_file, Yaml::encode($info));

    $theme_file = "$working_dir/$machine_name.theme";
    $theme = file_get_contents($theme_file);
    str_replace('brainsum_starterkit', $machine_name, $theme);
    file_put_contents($theme_file, $theme);

    $links_node_twig_file = "$working_dir/templates/content/links--node.html.twig";
    $links_node_twig_content = file_get_contents($links_node_twig_file);
    str_replace('brainsum_starterkit', $machine_name, $links_node_twig_content);
    file_put_contents($links_node_twig_file, $links_node_twig_content);
  }

}
