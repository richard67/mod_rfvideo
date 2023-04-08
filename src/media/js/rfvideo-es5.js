(function () {
  'use strict';

  /**
   * @copyright  (C) 2022 Richard Fath <https://www.richard-fath.de>
   * @license    GNU General Public License version 2 or later; see LICENSE.txt
   */
  if (!Joomla) {
    throw new Error('Joomla API was not properly initialized');
  }
  function sourceSelectChanged(elSelect, elPlayerDiv, elVideoDiv, elPlaylistWrapper, elPlaylistDiv, elVideo, sourceGroups) {
    var vidExt = elVideo.currentSrc.substr(elVideo.currentSrc.lastIndexOf('.'));
    var prevIdx = parseInt(elSelect.getAttribute('data-selected'), 10);
    if (vidExt === '' || Number.isNaN(prevIdx)) {
      return;
    }
    elVideo.pause();
    sourceGroups[elSelect.options.selectedIndex].sources.every(function (source) {
      if (source.substr(source.lastIndexOf('.')) === vidExt) {
        elPlayerDiv.classList.remove("rfvideoquality" + prevIdx);
        elVideoDiv.classList.remove("rfvideoquality" + prevIdx);
        elPlaylistWrapper.classList.remove("rfvideoquality" + prevIdx);
        elPlaylistDiv.classList.remove("rfvideoquality" + prevIdx);
        elVideo.poster = "/" + sourceGroups[elSelect.options.selectedIndex].image;
        elVideo.src = "/" + source;
        elPlayerDiv.classList.add("rfvideoquality" + elSelect.options.selectedIndex);
        elVideoDiv.classList.add("rfvideoquality" + elSelect.options.selectedIndex);
        elPlaylistWrapper.classList.add("rfvideoquality" + elSelect.options.selectedIndex);
        elPlaylistDiv.classList.add("rfvideoquality" + elSelect.options.selectedIndex);
        elSelect.setAttribute('data-selected', elSelect.options.selectedIndex);
        elVideo.load();
        return false;
      }
      return true;
    });
  }
  function seek(el, pos) {
    el.currentTime = pos;
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
      var _loop = function _loop() {
        var myPlaylistItem = myPlaylistItems[i].getElementsByTagName('button')[0];
        var item = {
          start: parseFloat(myPlaylistItem.getAttribute('data-start')).toFixed(1),
          title: myPlaylistItem.innerHTML
        };
        myPlaylist[i] = item;
        myPlaylistItem.addEventListener('click', function () {
          seek(myVideo, item.start);
        });
      };
      for (var i = 0; i < myPlaylistItems.length; i += 1) {
        _loop();
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
      var _loop2 = function _loop2() {
        var myPlaylistItem = myPlaylistItems[_i].getElementsByTagName('button')[0];
        myPlaylistItem.addEventListener('click', function () {
          seek(myVideo, parseFloat(myPlaylistItem.getAttribute('data-start')).toFixed(1));
        });
      };
      for (var _i = 0; _i < myPlaylistItems.length; _i += 1) {
        _loop2();
      }
    }
    if (mySourceSelect) {
      var mySourceGroups = [];
      mySourceSelect.value = mySourceSelect.options[0].value;
      for (var _i2 = 0; _i2 < mySourceSelect.length; _i2 += 1) {
        var opts = mySourceSelect.options[_i2].value.split(';');
        var group = {
          image: opts[0],
          sources: opts.slice(1)
        };
        mySourceGroups[_i2] = group;
      }
      mySourceSelect.addEventListener('change', function () {
        sourceSelectChanged(mySourceSelect, myVideoPlayerDiv, myVideoDiv, myPlaylistWrapper, myPlaylistDiv, myVideo, mySourceGroups);
      });
    }
  });

})();
