const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { code } = event
  
  try {
    const wxContext = cloud.getWXContext()
    return {
      openid: wxContext.OPENID,
      success: true
    }
  } catch (e) {
    return {
      success: false,
      error: e.message
    }
  }
}
