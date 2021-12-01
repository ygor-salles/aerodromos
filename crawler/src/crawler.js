const axios = require('axios')

const client = axios.create({
  baseURL: 'https://api-redemet.decea.mil.br/',
  timeout: 5000,
  headers: {'X-Api-Key': 'rGQZOWtDeSq2Kg1TyuCQNBm0cRG2Bg5BBNsE0SYL'}
});

const crawlAerodromes = async () => {
  try {
    const response = await client.get('/aerodromos/')
    const data = response.data.data
    return data.map(item => ({
      ...item,
      latitude: +item.lat_dec,
      longitude: +item.lon_dec
    }))
  } catch(e) {
    return null
  }
}

const crawlMETAR = async (local) => {
  try {
    const response = await client.get('/mensagens/metar/' + local)
    const data = response?.data?.data?.data[0]
    if(!data) return null
    return {
      ...data,
      validade_inicial: new Date(data.validade_inicial),
      recebimento: new Date(data.recebimento)
    }
  } catch(e) {
    console.log(e)
    return null
  }
}

const crawlTAF = async (local) => {
  try {
    const response = await client.get('/mensagens/taf/' + local)
    const data = response?.data?.data?.data[0]
    if(!data) return null
    return {
      ...data,
      validade_inicial: new Date(data.validade_inicial),
      recebimento: new Date(data.recebimento)
    }
  } catch(e) {
    console.log(e)
    return null
  }
}

const crawlSTSC = async () => {
  try {
    const response = await client.get('/produtos/stsc')
    return response?.data?.data?.stsc?.[0]?.map(item => ({ ...item, la: +item.la, lo: +item.lo}))
  } catch(e) {
    console.log(e)
    return null
  }
}

module.exports = {
  crawlAerodromes,
  crawlMETAR,
  crawlTAF,
  crawlSTSC
}