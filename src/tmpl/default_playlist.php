<?php

/**
 * @package     mod_rfvideo
 *
 * @copyright   (C) 2022 Richard Fath <https://www.richard-fath.de>
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC') or die;

use Joomla\CMS\Language\Text;

?>
<div class="rfvideoplaylistwrapper" data-min-height="<?php echo $playlistMinHeight; ?>" data-min-width="<?php echo $playlistMinWidth; ?>" style="flex: 1 1 <?php echo $playlistMinWidth; ?>px; max-width: <?php echo $sourceGroups->source_groups0->width; ?>px;">
    <div class="rfvideoplaylisttop"> </div>
    <div class="rfvideoplaylist" style="flex: 1 1 <?php echo $playlistMinHeight; ?>px; max-height: <?php echo $sourceGroups->source_groups0->height; ?>px;">
        <?php if (array_values($playlist)[0]->position > 0) : ?>
        <ol class="rfvideoplaylist-list" start="0">
            <li class="rfvideoplaylist-item rfvideoplaylist-start"><button data-start="0"><?php echo Text::_('MOD_RFVIDEO_PLAYLIST_START'); ?></button></li>
        <?php else : ?>
        <ol class="rfvideoplaylist-list">
        <?php endif; ?>
            <?php foreach ($playlist as $item) : ?>
            <li class="rfvideoplaylist-item">
                <button data-start="<?php echo $item->position; ?>"><?php echo $item->title; ?>
                <?php if ($showItemDuration && !empty($item->duration)) : ?>
                <span class="rfvideo-duration">
                    <?php echo preg_replace('/^0[0]+' . Text::_('MOD_RFVIDEO_PLAYLIST_TIME_SEPARATOR') . '/', '', \DateTime::createFromFormat('U', round($item->duration))->format(Text::_('MOD_RFVIDEO_PLAYLIST_TIME_FORMAT'))); ?>
                </span>
                <?php endif; ?>
                </button>
            </li>
            <?php endforeach; ?>
        </ol>
    </div>
</div>
