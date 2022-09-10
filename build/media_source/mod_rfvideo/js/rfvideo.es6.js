function selChangeQ(elSelect, elVideoDiv, elPlaylistDiv, elVideo, sourceGroups) {
  const vidExt = elVideo.currentSrc.substr(elVideo.currentSrc.lastIndexOf('.'));

  if (vidExt === '') {
    return;
  }

  elVideo.pause();
  let suffixOld = sourceGroups[elSelect.getAttribute('data-selected')].suffix;
  let suffixNew = sourceGroups[elSelect.options.selectedIndex].suffix;
  elVideoDiv.classList.remove('rfvideo' + suffixOld);
  elPlaylistDiv.classList.remove('rfvideoplaylist' + suffixOld);
  elVideoDiv.classList.add('rfvideo' + suffixNew);
  elPlaylistDiv.classList.add('rfvideoplaylist' + suffixNew);
  elVideo.width = sourceGroups[elSelect.options.selectedIndex].width;
  elVideo.height = sourceGroups[elSelect.options.selectedIndex].height;
  elVideo.poster = '/' + sourceGroups[elSelect.options.selectedIndex].image;
  sourceGroups[elSelect.options.selectedIndex].sources.forEach(source => {
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

const allVideoPlayerDivs = document.querySelectorAll('div.rfvideoplayer');
allVideoPlayerDivs.forEach(videoPlayerDiv => {
  const myVideoDiv = videoPlayerDiv.querySelector('.rfvideo');
  const myPlaylistDiv = videoPlayerDiv.querySelector('.rfvideoplaylist');
  const mySelectQ = videoPlayerDiv.getElementsByTagName('select')[0];
  const myVideo = videoPlayerDiv.getElementsByTagName('video')[0];
  const myStatus = videoPlayerDiv.querySelector('.rfvideostatus');
  const myPlaylistItems = videoPlayerDiv.getElementsByTagName('li');

  const textLoading = Joomla.Text._('MOD_RFVIDEO_LOADING').replace('&hellip;', '\u{2026}');

  const textSeeking = Joomla.Text._('MOD_RFVIDEO_SEEKING').replace('&hellip;', '\u{2026}');

  for (let i = 0; i < myPlaylistItems.length; ++i) {
    const myPlaylistItem = myPlaylistItems[i].getElementsByTagName('a')[0];
    myPlaylistItem.addEventListener('click', function () {
      seek(myVideo, parseFloat(myPlaylistItem.getAttribute('data-start')));
    });
  }

  if (mySelectQ) {
    let mySourceGroups = [];

    for (let i = 0; i < mySelectQ.size; ++i) {
      const opts = mySelectQ.options[i].value.split(';');
      let group = {
        'suffix': opts[0],
        'height': opts[1],
        'width': opts[2],
        'image': opts[3],
        'sources': opts.slice(4)
      };
      mySourceGroups[i] = group;
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
