<?php

/**
 * @package     mod_rfvideo
 *
 * @copyright   (C) 2022 Richard Fath <https://www.richard-fath.de>
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

namespace Joomla\Module\RfVideo\Site\Helper;

use Joomla\CMS\Filesystem\Path;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Language\Text;
use Joomla\Registry\Registry;
use Joomla\Utilities\ArrayHelper;

// phpcs:disable PSR1.Files.SideEffects
\defined('_JEXEC') or die;
// phpcs:enable PSR1.Files.SideEffects

/**
 * Helper for mod_rfvideo
 *
 * @since  1.0.0
 */
class RfVideoHelper
{
    /**
     * Build the source group select element
     *
     * @param   Registry  $sourceGroups  The source groups parameter.
     *
     * @return  string
     *
     * @since   1.0.0
     */
    public function getSourceGroupSelect(Registry $params)
    {
        $sourceGroups   = $params->get('source_groups');
        $selectPosition = $params->get('select_position', 'none');

        if (!isset($sourceGroups->source_groups1->sources->sources0) || $selectPosition === 'none') {
            return '';
        }

        $playlistMinHeight = $params->get('playlist_min_height', 120);
        $playlistMinWidth  = $params->get('playlist_min_width', 320);
        $descr             = $params->get('select_description', '');
        $label             = $params->get('select_label', '');
        $size              = $params->get('select_size', '1');
        $count             = 0;

        $selectHtmlStart = '<div class="rfvidqseldiv rfvidqseldiv-' . $selectPosition . '"><form>';

        if ($label) {
            $selectHtmlStart .= '<label for="rfvideoselect{moduleId}">' . Text::_($label) . '</label>';
        }

        $selectHtmlStart .= '<select class="rfvideoselect" name="rfvideoselect" id="rfvideoselect{moduleId}" size="';

        $selectHtmlEnd = '" data-selected="0">';

        foreach ($sourceGroups as $sourceGroup) {
            $option = $sourceGroup->height . ';' . $sourceGroup->width . ';'
            . ($sourceGroup->width + $playlistMinWidth) . 'px;'
            . HTMLHelper::_('cleanImageURL', $sourceGroup->image)->url;

            foreach ($sourceGroup->sources as $source) {
                $option .= ';' . HTMLHelper::_('cleanImageURL', $source->file)->url;
            }

            $selectHtmlEnd .= '<option value="' . $option . '">' . ($sourceGroup->description ? Text::_($sourceGroup->description) : $sourceGroup->width . ' x ' . $sourceGroup->height) . '</option>';
            $count += 1;
        }

        $selectHtmlEnd .= '</select></form>';

        if ($descr) {
            $selectHtmlEnd .= '<div>' . Text::_($descr) . '</div>';
        }

        $selectHtmlEnd .= '</div>';

        return $selectHtmlStart . (($size > 0 && $size < $count) ? $size : $count) . $selectHtmlEnd;
    }

    /**
     * Build the video attributes string
     *
     * @param   Registry  $params  The module parameters.
     *
     * @return  string
     *
     * @since   1.0.0
     */
    public function getVideoAttributes(Registry $params)
    {
        $sourceGroups = $params->get('source_groups');

        if (empty($sourceGroups)) {
            return '';
        }

        $videoAttribs = ' preload="' . $params->get('preload') . '"';

        foreach (['autoplay', 'controls', 'loop', 'muted'] as $attribute) {
            $videoAttribs .= $params->get($attribute) ? ' ' . $attribute . '="' . $attribute . '"' : '';
        }

        $videoAttribs .= $sourceGroups->source_groups0->image ? ' poster="' . HTMLHelper::_('cleanImageURL', $sourceGroups->source_groups0->image)->url . '"' : '';
        $videoAttribs .= ' width="' . $sourceGroups->source_groups0->width . '"';
        $videoAttribs .= ' height="' . $sourceGroups->source_groups0->height . '"';

        // Use src attribute if there is only one source file
        if (!(isset($sourceGroups->source_groups1) || isset($sourceGroups->source_groups0->sources->sources1))) {
            $videoAttribs .= ' src="' . HTMLHelper::_('cleanImageURL', $sourceGroups->source_groups0->sources->sources0->file)->url . '"';
        }

        return $videoAttribs;
    }

    /**
     * Get playlist from module parameters
     *
     * @param   Registry  $params  The module parameters.
     *
     * @return  array
     *
     * @since   2.0.0
     */
    private function getPlaylistFromParams(Registry $params)
    {
        return ArrayHelper::fromObject($params->get('playlist'), false);
    }

    /**
     * Get playlist from WEBVTT file
     *
     * @param   Registry  $params  The module parameters.
     *
     * @return  array
     *
     * @since   2.0.0
     */
    private function getPlaylistFromFileWebvtt(Registry $params)
    {
        $playlist = [];

        $file = $params->get('playlist_file', '');

        if (empty($file)) {
            return $playlist;
        }

        $file = Path::clean(JPATH_ROOT . '/media/mod_rfvideo/vtt/' . $file);

        $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        $item = null;

        foreach ($lines as $line) {
            if (preg_match('/^([^->\s]+)\s+-->\s+([^->\s]+)\s*$/', $line, $matches)) {
                $base = floatval(\DateTime::createFromFormat('Y-m-d H:i:s.u', '2000-01-01 00:00:00.000')->format('U.u'));
                $start = floatval(\DateTime::createFromFormat('Y-m-d H:i:s.u', '2000-01-01 ' . $matches[1])->format('U.u'));
                $end = floatval(\DateTime::createFromFormat('Y-m-d H:i:s.u', '2000-01-01 ' . $matches[2])->format('U.u'));
                $item = new \stdClass();
                $item->position = round($start - $base, 3);
                $item->duration = round($end - $start, 3);
                $item->title    = '';
            } elseIf (!empty($item) && !strpos($line, 'WEBVTT')) {
                $item->title = $line;
                $playlist[] = $item;
                $item = null;
            }
        }

        return $playlist;
    }

    /**
     * Pre-process the playlist
     *
     * @param   Registry  $params  The module parameters.
     *
     * @return  array
     *
     * @since   2.0.0
     */
    public function getPlaylist(Registry $params)
    {
        if ($params->get('playlist_source', '0') === '1') {
            return $this->getPlaylistFromFileWebvtt($params);
        }

        return $this->getPlaylistFromParams($params);
    }
}
