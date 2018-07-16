const {ipcRenderer} = require('electron');

var dialog_addFolder;
var snackbar;
var select_outDevive;

var jsonObject;
var folders = [];

const error_folderAdd = {
  message: 'The path is invalid',
  actionText: 'Retry',
  actionHandler: () => {
    dialog_addFolder.show();
  }
}

function init() {
  var elements = document.querySelectorAll('.mdc-ripple');
  for (var i = 0, element; element = elements[i]; i++) {
    mdc.ripple.MDCRipple.attachTo(element);
  }

  snackbar = mdc.snackbar.MDCSnackbar.attachTo(document.querySelector('.mdc-snackbar'));
  select_outDevive = mdc.select.MDCSelect.attachTo(document.getElementById('select_outDevive'));


  document.getElementById('btn_ok').onclick = () => {
    saveSettings();
    ipcRenderer.send('settings_close');
  };
  document.getElementById('btn_cancel').onclick = () => {
    ipcRenderer.send('settings_close');
  };
  document.getElementById('btn_apply').onclick = () => {
    saveSettings();
  };

  document.getElementById('btn_music-lib').onclick = () => {
    document.getElementById('content_music-lib').style.display = "block";
    document.getElementById('content_playback').style.display = "none";
    document.getElementById('content_shell').style.display = "none";

    document.getElementById('btn_music-lib').classList.add('mdc-list-item--activated');
    document.getElementById('btn_playback').classList.remove('mdc-list-item--activated');
    document.getElementById('btn_shell').classList.remove('mdc-list-item--activated');
  };
  document.getElementById('btn_playback').onclick = () => {
    document.getElementById('content_music-lib').style.display = "none";
    document.getElementById('content_playback').style.display = "block";
    document.getElementById('content_shell').style.display = "none";

    document.getElementById('btn_music-lib').classList.remove('mdc-list-item--activated');
    document.getElementById('btn_playback').classList.add('mdc-list-item--activated');
    document.getElementById('btn_shell').classList.remove('mdc-list-item--activated');
  };
  document.getElementById('btn_shell').onclick = () => {
    document.getElementById('content_music-lib').style.display = "none";
    document.getElementById('content_playback').style.display = "none";
    document.getElementById('content_shell').style.display = "block";

    document.getElementById('btn_music-lib').classList.remove('mdc-list-item--activated');
    document.getElementById('btn_playback').classList.remove('mdc-list-item--activated');
    document.getElementById('btn_shell').classList.add('mdc-list-item--activated');
  };

  dialog_addFolder = mdc.dialog.MDCDialog.attachTo(document.getElementById('dialog_addFolder'));
  field_addFolder = mdc.textField.MDCTextField.attachTo(document.getElementById('field_addFolder'));
  document.getElementById('btn_addFolder').onclick = () => {
    dialog_addFolder.show();
  };
  dialog_addFolder.listen('MDCDialog:accept', function() {
    if (ipcRenderer.sendSync('isValidPath', field_addFolder.value)) {
      addFolderListEntry(field_addFolder.value, folders.length);
    } else {
      snackbar.show(error_folderAdd);
    }
  });
  document.getElementById('field_input_addFolder').onchange = () => {
    if (field_addFolder.valid) {
      document.getElementById('btn_dialog_addFolder').disabled = false;
    } else {
      document.getElementById('btn_dialog_addFolder').disabled = true;
    }
  };

  document.getElementById('btn_openDialog').onclick = () => {
    field_addFolder.value = ipcRenderer.sendSync('openDirDialog');
    if (field_addFolder.valid) {
      document.getElementById('btn_dialog_addFolder').disabled = false;
    }
  }
}

function saveSettings() {
  jsonObject.music_folders = folders;
  ipcRenderer.send('settings_saveToFile', jsonObject);
}

Element.prototype.remove = function() {
  this.parentElement.removeChild(this);
}

ipcRenderer.on('load_settings', (event, json) => {
  jsonObject = json;
  var list = document.getElementById('list_musicFolders');
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }
  for (i = 0; i < json.music_folders.length; i++) {
    addFolderListEntry(json.music_folders[i], i);
  }

  var select = document.getElementById('select_content_outDevive');
  while (select.firstChild) {
    select.removeChild(select.firstChild);
  }
  navigator.mediaDevices.enumerateDevices().then(function(devices) {
    devices.forEach(function(device) {
      if (device.kind == 'audiooutput' && device.deviceId != 'communications') {
        select.innerHTML += '<option value="' + device.deviceId + '">' + device.label + '</option>'
      }
    });
  });
  setTimeout(() => {select_outDevive.value = json.output_device}, 10);
});

function deleteFolder(element) {
  var li = element.parentElement;
  li.style.height = "0";
  folders.splice(folders.indexOf(li.childNodes[0].innerText), 1);
  setTimeout(() => {li.remove();}, 500);
}

function addFolderListEntry(folder, index) {
  var list = document.getElementById('list_musicFolders');
  folders[index] = folder;
  list.innerHTML += '<li class="mdc-list-item"><span class="mdc-list-item__text">' + folder + '</span><button onclick="deleteFolder(this)" class="mdc-list-item__meta mdc-icon-button material-icons mdc-ripple" data-mdc-ripple-is-unbounded>delete</button></li>';
}


window.onload = init;
