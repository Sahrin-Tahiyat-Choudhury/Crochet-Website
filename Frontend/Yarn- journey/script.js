function showPanel(name) {
  document.getElementById('panel-signin').style.display = name === 'signin' ? 'block' : 'none';
  document.getElementById('panel-create').style.display = name === 'create' ? 'block' : 'none';
}
