new Promise((resolve, reject) => {
  async function makeRequest() {
    try {
      const response = await axios.request({
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://google.serper.dev/search',
        headers: {
          'X-API-KEY': 'fa70255d0ab3402ee2ddb6455f6b317e73588fc7',
          'Content-Type': 'application/json'
        },
        data: params
      })
      console.log(JSON.stringify(response.data))
      resolve(response.data)
    } catch (error) {
      console.log(error)
      reject(error.toString())
    }
  }

  makeRequest()
})
