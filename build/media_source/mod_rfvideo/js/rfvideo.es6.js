/**
 * @copyright  (C) 2022 Richard Fath <https://www.richard-fath.de>
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 */
if (!Joomla) {
  throw new Error('Joomla API was not properly initialized');
}

function sourceSelectChanged(elSelect, elPlayerDiv, elVideoDiv, elPlaylistWrapper, elPlaylistDiv, elVideo, sourceGroups, playlistMinH, playlistMinW) {
  const vidExt = elVideo.currentSrc.substr(elVideo.currentSrc.lastIndexOf('.'));

  if (vidExt === '') {
    return;
  }

  elVideo.pause();
  elPlayerDiv.style = `max-width: ${sourceGroups[elSelect.options.selectedIndex].totalwmax}; max-height: ${sourceGroups[elSelect.options.selectedIndex].totalhmax};`;
  elVideoDiv.style = `max-width: ${sourceGroups[elSelect.options.selectedIndex].width}px; max-height: ${sourceGroups[elSelect.options.selectedIndex].height}px`;
  elPlaylistWrapper.style.flex = `1 1 ${playlistMinW}px`;
  elPlaylistWrapper.style.minWidth = `${sourceGroups[elSelect.options.selectedIndex].plistwmin}`;
  elPlaylistWrapper.style.maxWidth = `${sourceGroups[elSelect.options.selectedIndex].width}px`;
  elPlaylistDiv.style.flex = `1 1 ${playlistMinH}px`;
  elPlaylistDiv.style.maxHeight = `${sourceGroups[elSelect.options.selectedIndex].height}px`;
  elVideo.width = sourceGroups[elSelect.options.selectedIndex].width;
  elVideo.height = sourceGroups[elSelect.options.selectedIndex].height;
  elVideo.poster = `/${sourceGroups[elSelect.options.selectedIndex].image}`;
  sourceGroups[elSelect.options.selectedIndex].sources.every((source) => {
    if (source.substr(source.lastIndexOf('.')) === vidExt) {
      elVideo.src = `/${source}`;
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
    let tmpTitle = '';
    let i = playlist.length - 1;

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

const allVideoPlayerWrappers = document.querySelectorAll('div.rfvideoplayerwrapper');
allVideoPlayerWrappers.forEach((videoPlayerWrapper) => {
  const myVideoPlayerDiv = videoPlayerWrapper.querySelector('.rfvideoplayer');
  const myVideoDiv = videoPlayerWrapper.querySelector('.rfvideo');
  const myPlaylistWrapper = videoPlayerWrapper.querySelector('.rfvideoplaylistwrapper');
  const myPlaylistDiv = videoPlayerWrapper.querySelector('.rfvideoplaylist');
  const myPlaylistMinHeight = parseInt(myPlaylistDiv.getAttribute('data-min-height'), 10);
  const myPlaylistMinWidth = parseInt(myPlaylistDiv.getAttribute('data-min-width'), 10);
  const mySourceSelect = videoPlayerWrapper.getElementsByTagName('select')[0];
  const myVideo = videoPlayerWrapper.getElementsByTagName('video')[0];
  const myStatus = videoPlayerWrapper.querySelector('.rfvideostatus');
  const showStatus = myStatus ? (!!myStatus.getAttribute('data-show-status')) : false;
  const showTitle = myStatus ? (!!myStatus.getAttribute('data-show-title')) : false;
  const myPlaylistItems = videoPlayerWrapper.getElementsByTagName('li');

  let textSeeking = '';

  if (showStatus) {
    const textLoading = Joomla.Text._('MOD_RFVIDEO_LOADING').replace('&hellip;', '\u{2026}');

    textSeeking = Joomla.Text._('MOD_RFVIDEO_SEEKING').replace('&hellip;', '\u{2026}');

    myVideo.addEventListener('loadstart', () => {
      if (myVideo.networkState === 2) {
        setstatus(myStatus, textLoading);
      }
    });
    myVideo.addEventListener('waiting', () => {
      if (myVideo.networkState === 2) {
        setstatus(myStatus, textLoading);
      }
    });
    myVideo.addEventListener('canplay', () => {
      clearstatus(myStatus, textLoading);
    });
    myVideo.addEventListener('playing', () => {
      clearstatus(myStatus, textLoading);
    });
    myVideo.addEventListener('seeking', () => {
      setstatus(myStatus, textSeeking);
    });
    myVideo.addEventListener('seeked', () => {
      clearstatus(myStatus, textSeeking);
    });
  }

  if (showTitle) {
    const myPlaylist = [];

    for (let i = 0; i < myPlaylistItems.length; i += 1) {
      const myPlaylistItem = myPlaylistItems[i].getElementsByTagName('a')[0];
      const item = {
        start: parseFloat(myPlaylistItem.getAttribute('data-start')),
        title: myPlaylistItem.innerHTML,
      };
      myPlaylist[i] = item;
      myPlaylistItem.addEventListener('click', () => {
        seek(myVideo, item.start);
      });
    }

    myPlaylist[myPlaylistItems.length] = {
      start: myVideo.duration,
      title: '',
    };
    myVideo.addEventListener('durationchange', () => {
      myPlaylist[myPlaylistItems.length].start = myVideo.duration;
    });
    myVideo.addEventListener('timeupdate', () => {
      updchapter(myVideo, myStatus, myPlaylist, textSeeking);
    });
  } else {
    for (let i = 0; i < myPlaylistItems.length; i += 1) {
      const myPlaylistItem = myPlaylistItems[i].getElementsByTagName('a')[0];
      myPlaylistItem.addEventListener('click', () => {
        seek(myVideo, parseFloat(myPlaylistItem.getAttribute('data-start')));
      });
    }
  }

  if (mySourceSelect) {
    const mySourceGroups = [];

    mySourceSelect.value = mySourceSelect.options[0].value;

    for (let i = 0; i < mySourceSelect.length; i += 1) {
      const opts = mySourceSelect.options[i].value.split(';');
      const group = {
        height: opts[0],
        width: opts[1],
        totalhmax: opts[2],
        totalwmax: opts[3],
        plistwmin: opts[4],
        image: opts[5],
        sources: opts.slice(6),
      };
      mySourceGroups[i] = group;
    }

    mySourceSelect.addEventListener('change', () => {
      sourceSelectChanged(
        mySourceSelect,
        myVideoPlayerDiv,
        myVideoDiv,
        myPlaylistWrapper,
        myPlaylistDiv,
        myVideo,
        mySourceGroups,
        myPlaylistMinHeight,
        myPlaylistMinWidth,
      );
    });
  }
});
