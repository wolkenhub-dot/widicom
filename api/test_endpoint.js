const axios = require('axios');
axios.get('http://localhost:3000/search?query=bob%20esponja')
  .then(res => {
     console.log('Status HTTP:', res.status);
     console.log('Total Resultados:', res.data.total_resultados);
     console.log('Amostra:', res.data.resultados);
  })
  .catch(err => {
     console.error('Falhou chamando a API local:', err.message);
  });
