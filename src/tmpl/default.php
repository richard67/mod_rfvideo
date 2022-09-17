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

$title        = Text::_($params->get('title'));
$downloadLink = $params->get('download_link', '');
$playlist     = $params->get('playlist');
$useSources   = strpos($videoAttribs, ' src="') === false;

// Load JS language strings
Text::script('MOD_RFVIDEO_LOADING');
Text::script('MOD_RFVIDEO_SEEKING');

?>
<div class="rfvideoplayer">
<?php if ($params->get('select_position', 'none') === 'top') : ?>
<?php echo str_replace('{moduleId}', $module->id, $selectHtml); ?>
<?php endif; ?>
<div class="rfvideo rfvideo<?php echo $sourceGroups->source_groups0->suffix; ?>">
<video title="<?php echo $title; ?>"<?php echo $videoAttribs; ?>>
<?php if ($useSources) : ?>
<?php foreach ($sourceGroups->source_groups0->sources as $source) : ?>
<source src="<?php echo HTMLHelper::_('cleanImageURL', $source->file)->url; ?>" type="<?php echo $source->type; ?>" />
<?php endforeach; ?>
<?php endif; ?>
<?php echo Text::_('MOD_RFVIDEO_NO_BROWSER_SUPPORT'); ?>
<?php if ($downloadLink) : ?>
<?php echo ' ' . Text::sprintf('MOD_RFVIDEO_USE_DOWNLOAD', $downloadLink); ?>
<?php endif; ?>
</video>
<div class="rfvideostatus"> </div>
</div>
<?php if (!empty($playlist)) : ?>
<div class="rfvideoplaylist rfvideoplaylist<?php echo $sourceGroups->source_groups0->suffix; ?>">
<ul class="rfvideoplaylist-list">
<?php if ($playlist->playlist0->position > 0) : ?>
<li class="rfvideoplaylist-item"><a data-start="0"><?php echo Text::_('MOD_RFVIDEO_PLAYLIST_START'); ?></a></li>
<?php endif; ?>
<?php $count = 0; ?>
<?php foreach ($playlist as $item) : ?>
<li class="rfvideoplaylist-item"><a data-start="<?php echo $item->position; ?>"><?php echo ++$count; ?>. <?php echo $item->title; ?></a></li>
<?php endforeach; ?>
</ul>
</div>
<?php endif; ?>
<?php if ($params->get('select_position', 'none') === 'bottom') : ?>
<?php echo str_replace('{moduleId}', $module->id, $selectHtml); ?>
<?php endif; ?>
</div>
