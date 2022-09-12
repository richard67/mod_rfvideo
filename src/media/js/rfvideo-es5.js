(function () {
  'use strict';

  function selChangeQ(elSelect, elVideoDiv, elPlaylistDiv, elVideo, sourceGroups) {
    var vidExt = elVideo.currentSrc.substr(elVideo.currentSrc.lastIndexOf('.'));

    if (vidExt === '') {
      return;
    }

    elVideo.pause();
    var suffixOld = sourceGroups[elSelect.getAttribute('data-selected')].suffix;
    var suffixNew = sourceGroups[elSelect.options.selectedIndex].suffix;
    elVideoDiv.classList.remove('rfvideo' + suffixOld);
    elPlaylistDiv.classList.remove('rfvideoplaylist' + suffixOld);
    elVideoDiv.classList.add('rfvideo' + suffixNew);
    elPlaylistDiv.classList.add('rfvideoplaylist' + suffixNew);
    elVideo.width = sourceGroups[elSelect.options.selectedIndex].width;
    elVideo.height = sourceGroups[elSelect.options.selectedIndex].height;
    elVideo.poster = '/' + sourceGroups[elSelect.options.selectedIndex].image;
    sourceGroups[elSelect.options.selectedIndex].sources.forEach(function (source) {
      if (source.substr(source.lastIndexOf('.')) === vidExt) {
        elVideo.src = '/' + source;
        return false;
      }
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
    var mySelectQ = videoPlayerDiv.getElementsByTagName('select')[0];
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

    for (var i = 0; i < myPlaylistItems.length; ++i) {
      _loop(i);
    }

    if (mySelectQ) {
      var mySourceGroups = [];

      for (var _i = 0; _i < mySelectQ.length; ++_i) {
        var opts = mySelectQ.options[_i].value.split(';');

        var group = {
          'suffix': opts[0],
          'height': opts[1],
          'width': opts[2],
          'image': opts[3],
          'sources': opts.slice(4)
        };
        mySourceGroups[_i] = group;
      }

      mySelectQ.addEventListener('change', function () {
        selChangeQ(mySelectQ, myVideoDiv, myPlaylistDiv, myVideo, mySourceGroups);
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
