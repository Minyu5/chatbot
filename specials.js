const fetch = require('node-fetch');

const getSpecialsInfo = () =>
  fetch(
    "https://xz94zfs6u8.execute-api.eu-west-1.amazonaws.com/default/myBakery"
  )
    .then(response => {
      return response.json();
    })
    .catch(error => console.log(error));

module.exports = getSpecialsInfo;
