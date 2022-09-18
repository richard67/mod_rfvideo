(function () {
  'use strict';

  /**
   * @copyright  (C) 2022 Richard Fath <https://www.richard-fath.de>
   * @license    GNU General Public License version 2 or later; see LICENSE.txt
   */
  if (!Joomla) {
    throw new Error('Joomla API was not properly initialized');
  }

  function sourceSelectChanged(elSelect, elPlayerDiv, elVideoDiv, elPlaylistDiv, elVideo, sourceGroups, playlistMinWidth) {
    var vidExt = elVideo.currentSrc.substr(elVideo.currentSrc.lastIndexOf('.'));

    if (vidExt === '') {
      return;
    }

    elVideo.pause();
    elPlayerDiv.style = "max-width: " + (parseInt(sourceGroups[elSelect.options.selectedIndex].width, 10) + playlistMinWidth) + "px;";
    elVideoDiv.style = "max-width: " + sourceGroups[elSelect.options.selectedIndex].width + "px; max-height: " + sourceGroups[elSelect.options.selectedIndex].height + "px;";
    elPlaylistDiv.style = "width: auto; min-width: " + playlistMinWidth + "px; max-width: " + sourceGroups[elSelect.options.selectedIndex].width + "px; max-height: " + sourceGroups[elSelect.options.selectedIndex].height + "px;";
    elVideo.width = sourceGroups[elSelect.options.selectedIndex].width;
    elVideo.height = sourceGroups[elSelect.options.selectedIndex].height;
    elVideo.poster = "/" + sourceGroups[elSelect.options.selectedIndex].image;
    sourceGroups[elSelect.options.selectedIndex].sources.every(function (source) {
      if (source.substr(source.lastIndexOf('.')) === vidExt) {
        elVideo.src = "/" + source;
        return false;
      }

      return true;
    });
    elSelect.setAttribute('data-selected', elSelect.options.selectedIndex);
    elVideo.load();
  }

  function seek(el, pos) {
    el.currentTime = pos.toFixed(1);
    el.play();
  }

  function setstatus(el, txt) {
    el.innerHTML = txt;
  }

  function clearstatus(el, txt) {
    if (el.innerHTML === txt) el.innerHTML = '';
  }

  var allVideoPlayerDivs = document.querySelectorAll('div.rfvideoplayer');
  allVideoPlayerDivs.forEach(function (videoPlayerDiv) {
    var myVideoDiv = videoPlayerDiv.querySelector('.rfvideo');
    var myPlaylistDiv = videoPlayerDiv.querySelector('.rfvideoplaylist');
    var myPlaylistMinWidth = parseInt(myPlaylistDiv.getAttribute('data-min-width'), 10);
    var mySourceSelect = videoPlayerDiv.getElementsByTagName('select')[0];
    var myVideo = videoPlayerDiv.getElementsByTagName('video')[0];
    var myStatus = videoPlayerDiv.querySelector('.rfvideostatus');
    var myPlaylistItems = videoPlayerDiv.getElementsByTagName('li');

    var textLoading = Joomla.Text._('MOD_RFVIDEO_LOADING').replace('&hellip;', "\u2026");

    var textSeeking = Joomla.Text._('MOD_RFVIDEO_SEEKING').replace('&hellip;', "\u2026");

    var _loop = function _loop(i) {
      var myPlaylistItem = myPlaylistItems[i].getElementsByTagName('a')[0];
      myPlaylistItem.addEventListener('click', function () {
        seek(myVideo, parseFloat(myPlaylistItem.getAttribute('data-start')));
      });
    };

    for (var i = 0; i < myPlaylistItems.length; i += 1) {
      _loop(i);
    }

    if (mySourceSelect) {
      var mySourceGroups = [];

      for (var _i = 0; _i < mySourceSelect.length; _i += 1) {
        var opts = mySourceSelect.options[_i].value.split(';');

        var group = {
          suffix: opts[0],
          height: opts[1],
          width: opts[2],
          image: opts[3],
          sources: opts.slice(4)
        };
        mySourceGroups[_i] = group;
      }

      mySourceSelect.addEventListener('change', function () {
        sourceSelectChanged(mySourceSelect, videoPlayerDiv, myVideoDiv, myPlaylistDiv, myVideo, mySourceGroups, myPlaylistMinWidth);
      });
    }

    myVideo.addEventListener('loadstart', function () {
      if (myVideo.networkState === 2) {
        setstatus(myStatus, textLoading);
      }
    });
    myVideo.addEventListener('waiting', function () {
      if (myVideo.networkState === 2) {
        setstatus(myStatus, textLoading);
      }
    });
    myVideo.addEventListener('canplay', function () {
      clearstatus(myStatus, textLoading);
    });
    myVideo.addEventListener('playing', function () {
      clearstatus(myStatus, textLoading);
    });
    myVideo.addEventListener('seeking', function () {
      setstatus(myStatus, textSeeking);
    });
    myVideo.addEventListener('seeked', function () {
      clearstatus(myStatus, textSeeking);
    });
  });

})();
