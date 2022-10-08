<?php

/**
 * @package     mod_rfvideo
 *
 * @copyright   (C) 2022 Richard Fath <https://www.richard-fath.de>
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC') or die;

use Joomla\CMS\Helper\ModuleHelper;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Language\Text;

if (empty($videoAttribs)) {
    return;
}

$sourceGroups = $params->get('source_groups');

if (empty($sourceGroups)) {
    return;
}

/** @var Joomla\CMS\WebAsset\WebAssetManager $wa */
$wa = $app->getDocument()->getWebAssetManager();
$wa->registerAndUseScript('mod_rfvideo.es5', 'mod_rfvideo/rfvideo-es5.min.js', [], ['nomodule' => true, 'defer' => true], ['core']);
$wa->registerAndUseScript('mod_rfvideo', 'mod_rfvideo/rfvideo.min.js', [], ['type' => 'module'], ['mod_rfvideo.es5', 'core']);

$stylesheet = $params->get('stylesheet', 'rfvideo.css');

if ($stylesheet !== '-1') {
    $wa->registerAndUseStyle('mod_rfvideo', 'mod_rfvideo/' . $stylesheet);
}

$title             = Text::_($module->title);
$showStatus        = $params->get('show_status', 0);
$downloadLink      = $params->get('download_link', '');
$showPlaylistItem  = $params->get('show_playlist_item', 0);
$showItemDuration  = $params->get('show_item_duration', 0);
$useSources        = strpos($videoAttribs, ' src="') === false;

if (empty($playlist)) {
    $playlistMinWidth  = 0;
    $playlistMinWidth  = 0;
} else {
    $playlistMinWidth  = $params->get('playlist_min_width', 320);
    $playlistMinHeight = $params->get('playlist_min_height', 120);

    // Limit to smallest video size
    foreach ($sourceGroups as $sourceGroup) {
        $playlistMinWidth  = $playlistMinWidth > $sourceGroup->width ? $sourceGroup->width : $playlistMinWidth;
        $playlistMinHeight = $playlistMinHeight > $sourceGroup->height ? $sourceGroup->height : $playlistMinHeight;
    }
}

// Load JS language strings
Text::script('MOD_RFVIDEO_LOADING');
Text::script('MOD_RFVIDEO_SEEKING');

?>
<div class="rfvideoplayerwrapper">
<?php if ($params->get('select_position', 'none') === 'top') : ?>
    <?php echo str_replace('{moduleId}', $module->id, $selectHtml); ?>
<?php endif; ?>
    <div class="rfvideoplayer" style="max-width: <?php echo ($sourceGroups->source_groups0->width + $playlistMinWidth); ?>px;">
        <div class="rfvideo" style="flex: 0 1 <?php echo $sourceGroups->source_groups0->width; ?>px;">
            <video title="<?php echo $title; ?>"<?php echo $videoAttribs; ?>>
            <?php if ($useSources) : ?>
                <?php foreach ($sourceGroups->source_groups0->sources as $source) : ?>
                <source src="<?php echo HTMLHelper::_('cleanImageURL', $source->file)->url; ?>" type="<?php echo $source->type; ?>" />
                <?php endforeach; ?>
            <?php endif; ?>
            <?php echo Text::_('MOD_RFVIDEO_NO_BROWSER_SUPPORT'); ?>
            <?php if ($downloadLink) :
                echo ' ' . Text::sprintf('MOD_RFVIDEO_USE_DOWNLOAD', $downloadLink);
            endif; ?>
            </video>
            <?php if ($showStatus || $showPlaylistItem) : ?>
            <div class="rfvideostatus"<?php echo $showStatus ? ' data-show-status="true"' : ''; ?><?php echo $showPlaylistItem ? ' data-show-title="true"' : ''; ?>> </div>
            <?php endif; ?>
        </div>
        <?php if (!empty($playlist)) : ?>
        <?php require ModuleHelper::getLayoutPath('mod_rfvideo', 'default_playlist'); ?>
        <?php endif; ?>
    </div>
<?php if ($params->get('select_position', 'none') === 'bottom') : ?>
    <?php echo str_replace('{moduleId}', $module->id, $selectHtml); ?>
<?php endif; ?>
</div>
