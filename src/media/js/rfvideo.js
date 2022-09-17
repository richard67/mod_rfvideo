/**
 * @copyright  (C) 2022 Richard Fath <https://www.richard-fath.de>
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 */
if (!Joomla) {
  throw new Error('Joomla API was not properly initialized');
}

function sourceSelectChanged(elSelect, elVideoDiv, elPlaylistDiv, elVideo, sourceGroups) {
  const vidExt = elVideo.currentSrc.substr(elVideo.currentSrc.lastIndexOf('.'));

  if (vidExt === '') {
    return;
  }

  elVideo.pause();
  const suffixOld = sourceGroups[elSelect.getAttribute('data-selected')].suffix;
  const suffixNew = sourceGroups[elSelect.options.selectedIndex].suffix;
  elVideoDiv.classList.remove(`rfvideo${suffixOld}`);
  elPlaylistDiv.classList.remove(`rfvideoplaylist${suffixOld}`);
  elVideoDiv.classList.add(`rfvideo${suffixNew}`);
  elPlaylistDiv.classList.add(`rfvideoplaylist${suffixNew}`);
  elVideo.width = sourceGroups[elSelect.options.selectedIndex].width;
  elVideo.height = sourceGroups[elSelect.options.selectedIndex].height;
  elVideo.poster = `/${sourceGroups[elSelect.options.selectedIndex].image}`;
  sourceGroups[elSelect.options.selectedIndex].sources.every(source => {
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

function setstatus(el, txt) {
  el.innerHTML = txt;
}

function clearstatus(el, txt) {
  if (el.innerHTML === txt) el.innerHTML = '';
}

const allVideoPlayerDivs = document.querySelectorAll('div.rfvideoplayer');
allVideoPlayerDivs.forEach(videoPlayerDiv => {
  const myVideoDiv = videoPlayerDiv.querySelector('.rfvideo');
  const myPlaylistDiv = videoPlayerDiv.querySelector('.rfvideoplaylist');
  const mySourceSelect = videoPlayerDiv.getElementsByTagName('select')[0];
  const myVideo = videoPlayerDiv.getElementsByTagName('video')[0];
  const myStatus = videoPlayerDiv.querySelector('.rfvideostatus');
  const myPlaylistItems = videoPlayerDiv.getElementsByTagName('li');

  const textLoading = Joomla.Text._('MOD_RFVIDEO_LOADING').replace('&hellip;', '\u{2026}');

  const textSeeking = Joomla.Text._('MOD_RFVIDEO_SEEKING').replace('&hellip;', '\u{2026}');

  for (let i = 0; i < myPlaylistItems.length; i += 1) {
    const myPlaylistItem = myPlaylistItems[i].getElementsByTagName('a')[0];
    myPlaylistItem.addEventListener('click', () => {
      seek(myVideo, parseFloat(myPlaylistItem.getAttribute('data-start')));
    });
  }

  if (mySourceSelect) {
    const mySourceGroups = [];

    for (let i = 0; i < mySourceSelect.length; i += 1) {
      const opts = mySourceSelect.options[i].value.split(';');
      const group = {
        suffix: opts[0],
        height: opts[1],
        width: opts[2],
        image: opts[3],
        sources: opts.slice(4)
      };
      mySourceGroups[i] = group;
    }

    mySourceSelect.addEventListener('change', () => {
      sourceSelectChanged(mySourceSelect, myVideoDiv, myPlaylistDiv, myVideo, mySourceGroups);
    });
  }

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
});
