export async function dispatchWrapper(command, data) {
  try {
    const response = await dysonVueStore.dispatch(command, data)
    console.log('response', response)

    // Check if there was an error
    if (response.code !== 0) {
      throw new Error(`Execution failed with code ${response.code}: ${response.rawLog}`)
    }

    // Parse the rawLog as JSON
    let rawLog = JSON.parse(response.rawLog)[0]
    let responseKey

    // Iterate through events to find the first 'response' event
    for (let event of rawLog.events) {
      for (let attribute of event.attributes) {
        if (attribute.key === 'response') {
          // Parse the 'value' as JSON and store it
          responseKey = JSON.parse(attribute.value)
          break
        }
      }
      if (responseKey) break // Exit if 'response' key is found
    }

    // Standardize the output
    return {
      transactionHash: response.transactionHash,
      ...responseKey
    }
  } catch (error) {
    // Wrap the error
    throw new Error(`Dispatch failed: ${error.message.split('\n')[0]}`)
  }
}
