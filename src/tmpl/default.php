<?php

/**
 * @package     mod_rfvideo
 *
 * @copyright   (C) 2022 Richard Fath <https://www.richard-fath.de>
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC') or die;

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
$playlistMinHeight = $params->get('playlist_min_height', 120);
$playlistMinWidth  = $params->get('playlist_min_width', 320);
$downloadLink      = $params->get('download_link', '');
$playlist          = $params->get('playlist');
$showPlaylistItem  = $params->get('show_playlist_item', 0);
$useSources        = strpos($videoAttribs, ' src="') === false;

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
        <div class="rfvideoplaylistwrapper" data-min-height="<?php echo $playlistMinHeight; ?>" data-min-width="<?php echo $playlistMinWidth; ?>" style="flex: 1 1 <?php echo $playlistMinWidth; ?>px; max-width: <?php echo $sourceGroups->source_groups0->width; ?>px;">
            <div class="rfvideoplaylisttop"> </div>
            <div class="rfvideoplaylist" style="flex: 1 1 <?php echo $playlistMinHeight; ?>px; max-height: <?php echo $sourceGroups->source_groups0->height; ?>px;">
                <?php if ($playlist->playlist0->position > 0) : ?>
                <ol class="rfvideoplaylist-list" start="0">
                    <li class="rfvideoplaylist-item rfvideoplaylist-start"><a data-start="0"><?php echo Text::_('MOD_RFVIDEO_PLAYLIST_START'); ?></a></li>
                <?php else : ?>
                <ol class="rfvideoplaylist-list">
                <?php endif; ?>
                    <?php foreach ($playlist as $item) : ?>
                    <li class="rfvideoplaylist-item"><a data-start="<?php echo $item->position; ?>"><?php echo $item->title; ?></a></li>
                    <?php endforeach; ?>
                </ol>
            </div>
        </div>
        <?php endif; ?>
    </div>
<?php if ($params->get('select_position', 'none') === 'bottom') : ?>
    <?php echo str_replace('{moduleId}', $module->id, $selectHtml); ?>
<?php endif; ?>
</div>
