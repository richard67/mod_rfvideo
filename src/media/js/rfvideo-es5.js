(function () {
  'use strict';

  /**
   * @copyright  (C) 2022 Richard Fath <https://www.richard-fath.de>
   * @license    GNU General Public License version 2 or later; see LICENSE.txt
   */
  if (!Joomla) {
    throw new Error('Joomla API was not properly initialized');
  }

  function sourceSelectChanged(elSelect, elPlayerDiv, elVideoDiv, elPlaylistWrapper, elPlaylistDiv, elVideo, sourceGroups, playlistMinH, playlistMinW) {
    var vidExt = elVideo.currentSrc.substr(elVideo.currentSrc.lastIndexOf('.'));

    if (vidExt === '') {
      return;
    }

    elVideo.pause();
    elPlayerDiv.style = "max-width: " + sourceGroups[elSelect.options.selectedIndex].totalwmax + ";";
    elVideoDiv.style.flex = "0 1 " + sourceGroups[elSelect.options.selectedIndex].width + "px";
    elPlaylistWrapper.style.flex = "1 1 " + playlistMinW + "px";
    elPlaylistWrapper.style.maxWidth = sourceGroups[elSelect.options.selectedIndex].width + "px";
    elPlaylistDiv.style.flex = "1 1 " + playlistMinH + "px";
    elPlaylistDiv.style.maxHeight = sourceGroups[elSelect.options.selectedIndex].height + "px";
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

  function updchapter(elVideo, elStatus, playlist, txtSeeking) {
    if (elVideo.seeking) {
      elStatus.innerHTML = txtSeeking;
    } else if (elVideo.currentTime <= 0) {
      elStatus.innerHTML = '';
    } else {
      var tmpTitle = '';
      var i = playlist.length - 1;

      while (i >= 0) {
        if (elVideo.currentTime >= playlist[i].start) {
          tmpTitle = playlist[i].title;
          break;
        }

        i -= 1;
      }

      elStatus.innerHTML = tmpTitle;
    }
  }

  function setstatus(el, txt) {
    el.innerHTML = txt;
  }

  function clearstatus(el, txt) {
    if (el.innerHTML === txt) el.innerHTML = '';
  }

  var allVideoPlayerWrappers = document.querySelectorAll('div.rfvideoplayerwrapper');
  allVideoPlayerWrappers.forEach(function (videoPlayerWrapper) {
    var myVideoPlayerDiv = videoPlayerWrapper.querySelector('.rfvideoplayer');
    var myVideoDiv = videoPlayerWrapper.querySelector('.rfvideo');
    var myPlaylistWrapper = videoPlayerWrapper.querySelector('.rfvideoplaylistwrapper');
    var myPlaylistDiv = videoPlayerWrapper.querySelector('.rfvideoplaylist');
    var myPlaylistMinHeight = parseInt(myPlaylistDiv.getAttribute('data-min-height'), 10);
    var myPlaylistMinWidth = parseInt(myPlaylistDiv.getAttribute('data-min-width'), 10);
    var mySourceSelect = videoPlayerWrapper.getElementsByTagName('select')[0];
    var myVideo = videoPlayerWrapper.getElementsByTagName('video')[0];
    var myStatus = videoPlayerWrapper.querySelector('.rfvideostatus');
    var showStatus = myStatus ? !!myStatus.getAttribute('data-show-status') : false;
    var showTitle = myStatus ? !!myStatus.getAttribute('data-show-title') : false;
    var myPlaylistItems = videoPlayerWrapper.getElementsByTagName('li');
    var textSeeking = '';

    if (showStatus) {
      var textLoading = Joomla.Text._('MOD_RFVIDEO_LOADING').replace('&hellip;', "\u2026");

      textSeeking = Joomla.Text._('MOD_RFVIDEO_SEEKING').replace('&hellip;', "\u2026");
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
    }

    if (showTitle) {
      var myPlaylist = [];

      var _loop = function _loop(i) {
        var myPlaylistItem = myPlaylistItems[i].getElementsByTagName('button')[0];
        var item = {
          start: parseFloat(myPlaylistItem.getAttribute('data-start')),
          title: myPlaylistItem.innerHTML
        };
        myPlaylist[i] = item;
        myPlaylistItem.addEventListener('click', function () {
          seek(myVideo, item.start);
        });
      };

      for (var i = 0; i < myPlaylistItems.length; i += 1) {
        _loop(i);
      }

      myPlaylist[myPlaylistItems.length] = {
        start: myVideo.duration,
        title: ''
      };
      myVideo.addEventListener('durationchange', function () {
        myPlaylist[myPlaylistItems.length].start = myVideo.duration;
      });
      myVideo.addEventListener('timeupdate', function () {
        updchapter(myVideo, myStatus, myPlaylist, textSeeking);
      });
    } else {
      var _loop2 = function _loop2(_i) {
        var myPlaylistItem = myPlaylistItems[_i].getElementsByTagName('button')[0];

        myPlaylistItem.addEventListener('click', function () {
          seek(myVideo, parseFloat(myPlaylistItem.getAttribute('data-start')));
        });
      };

      for (var _i = 0; _i < myPlaylistItems.length; _i += 1) {
        _loop2(_i);
      }
    }

    if (mySourceSelect) {
      var mySourceGroups = [];
      mySourceSelect.value = mySourceSelect.options[0].value;

      for (var _i2 = 0; _i2 < mySourceSelect.length; _i2 += 1) {
        var opts = mySourceSelect.options[_i2].value.split(';');

        var group = {
          height: opts[0],
          width: opts[1],
          totalwmax: opts[2],
          image: opts[3],
          sources: opts.slice(4)
        };
        mySourceGroups[_i2] = group;
      }

      mySourceSelect.addEventListener('change', function () {
        sourceSelectChanged(mySourceSelect, myVideoPlayerDiv, myVideoDiv, myPlaylistWrapper, myPlaylistDiv, myVideo, mySourceGroups, myPlaylistMinHeight, myPlaylistMinWidth);
      });
    }
  });

})();
