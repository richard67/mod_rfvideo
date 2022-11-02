/**
 * @copyright  (C) 2022 Richard Fath <https://www.richard-fath.de>
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 */
if (!Joomla) {
  throw new Error('Joomla API was not properly initialized');
}

function sourceSelectChanged(elSelect, elPlayerDiv, elVideoDiv, elPlaylistWrapper, elPlaylistDiv, elVideo, sourceGroups) {
  const vidExt = elVideo.currentSrc.substr(elVideo.currentSrc.lastIndexOf('.'));
  const prevIdx = parseInt(elSelect.getAttribute('data-selected'), 10);

  if (vidExt === '' || Number.isNaN(prevIdx)) {
    return;
  }

  elVideo.pause();

  sourceGroups[elSelect.options.selectedIndex].sources.every((source) => {
    if (source.substr(source.lastIndexOf('.')) === vidExt) {
      elPlayerDiv.classList.remove(`rfvideoquality${prevIdx}`);
      elVideoDiv.classList.remove(`rfvideoquality${prevIdx}`);
      elPlaylistWrapper.classList.remove(`rfvideoquality${prevIdx}`);
      elPlaylistDiv.classList.remove(`rfvideoquality${prevIdx}`);
      elVideo.poster = `/${sourceGroups[elSelect.options.selectedIndex].image}`;
      elVideo.src = `/${source}`;
      elPlayerDiv.classList.add(`rfvideoquality${elSelect.options.selectedIndex}`);
      elVideoDiv.classList.add(`rfvideoquality${elSelect.options.selectedIndex}`);
      elPlaylistWrapper.classList.add(`rfvideoquality${elSelect.options.selectedIndex}`);
      elPlaylistDiv.classList.add(`rfvideoquality${elSelect.options.selectedIndex}`);
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
      const myPlaylistItem = myPlaylistItems[i].getElementsByTagName('button')[0];
      const item = {
        start: parseFloat(myPlaylistItem.getAttribute('data-start')).toFixed(1),
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
      const myPlaylistItem = myPlaylistItems[i].getElementsByTagName('button')[0];
      myPlaylistItem.addEventListener('click', () => {
        seek(myVideo, parseFloat(myPlaylistItem.getAttribute('data-start')).toFixed(1));
      });
    }
  }

  if (mySourceSelect) {
    const mySourceGroups = [];

    mySourceSelect.value = mySourceSelect.options[0].value;

    for (let i = 0; i < mySourceSelect.length; i += 1) {
      const opts = mySourceSelect.options[i].value.split(';');
      const group = {
        image: opts[0],
        sources: opts.slice(1),
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
      );
    });
  }
});
