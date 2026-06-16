exports.main = async (event, context) => {
  const { code } = event
  
  try {
    const res = await cloud.auth().signInWithCode(code)
    return {
      openid: res.openid,
      success: true
    }
  } catch (e) {
    return {
      success: false,
      error: e.message
    }
  }
}
