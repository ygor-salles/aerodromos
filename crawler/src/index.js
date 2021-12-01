const pgConn = require('./database')
const crawler = require('./crawler')

const start = async () => {
  await pgConn.connectToDb()

  // Baixa e insere os aerodromos
  const aerodromes = await crawler.crawlAerodromes()
  for(let i=0; i < aerodromes.length; i++) {
    const aerodrome = aerodromes[i]
    await pgConn.insertAerodrome(aerodrome)

    // Busca e insere o METAR
    console.log("Obtendo o METAR de", aerodrome.cod)
    const metar = await crawler.crawlMETAR(aerodrome.cod)
    if(metar) {
      await pgConn.insertMETAR(metar)
    }

    // Busca e insere o TAF
    console.log("Obtendo o TAF de", aerodrome.cod)
    const taf = await crawler.crawlTAF(aerodrome.cod)
    console.log(taf)
    if(taf) {
      await pgConn.insertTAF(taf)
    }
  }

  // Baixa e insere o STSC
  const stsc = await crawler.crawlSTSC()
  await pgConn.insertSTSC(stsc)
}

start();