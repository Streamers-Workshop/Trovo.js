const TrovoApollo = require('./lib/apollo/TrovoApollo.js')

const main = async function () {
  try {
    const trovoApollo = new TrovoApollo()
    const { getLiveInfo } = await trovoApollo.GetLiveInfo('Pirolyx')
    console.log(getLiveInfo)

    // SetTitle require login
    // await trovoApollo.login('email@gmail.com', '###########')
    // await trovoApollo.SetTitle('Bonjour à tous')

  } catch (error) {
    console.error(error)
  }
}

main()
