<?php

/**
 * @package     mod_rfvideo
 *
 * @copyright   (C) 2022 Richard Fath <https://www.richard-fath.de>
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

namespace RichardFath\Module\RfVideo\Site\Dispatcher;

use Joomla\CMS\Dispatcher\AbstractModuleDispatcher;
use Joomla\CMS\Helper\HelperFactoryAwareInterface;
use Joomla\CMS\Helper\HelperFactoryAwareTrait;

// phpcs:disable PSR1.Files.SideEffects
\defined('JPATH_PLATFORM') or die;
// phpcs:enable PSR1.Files.SideEffects

/**
 * Dispatcher class for mod_rfvideo
 *
 * @since  1.0.0
 */
class Dispatcher extends AbstractModuleDispatcher implements HelperFactoryAwareInterface
{
    use HelperFactoryAwareTrait;

    /**
     * Returns the layout data.
     *
     * @return  array
     *
     * @since   1.0.0
     */
    protected function getLayoutData()
    {
        $data = parent::getLayoutData();

        $helper = $this->getHelperFactory()->getHelper('RfVideoHelper');

        $data['selectHtml']   = $helper->getSourceGroupSelect($data['params']);
        $data['videoAttribs'] = $helper->getVideoAttributes($data['params']);
        $data['playlist']     = $helper->getPlaylist($data['params']);
        $data['inlineCss']    = $helper->getInlineStyle($data['params'], !empty($data['playlist']));

        return $data;
    }
}
