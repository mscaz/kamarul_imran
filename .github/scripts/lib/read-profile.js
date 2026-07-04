const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function readProfile() {
  const filePath = path.join(__dirname, '..', '..', '..', 'profile.yaml');
  const text = fs.readFileSync(filePath, 'utf8');
  return yaml.load(text) || {};
}

module.exports = { readProfile };
