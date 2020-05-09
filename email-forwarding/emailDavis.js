const aws = require('aws-sdk');
const ses = new aws.SES();
const emailDavis = {};
const myEmail = process.env.EMAIL;
const sender = process.env.SENDER;
const myDomain = process.env.DOMAIN;

emailDavis.send = async (event) => {
  try {
    const emailParams = emailDavis.generateEmailParams(event.body)
    const data = await ses.sendEmail(emailParams).promise()
    return emailDavis.generateResponse(200, data)
  } catch (err) {
    return emailDavis.generateError(500, err)
  }
}

emailDavis.generateResponse = (code, payload) => {
  return {
    statusCode: code,
    headers: {
      'Access-Control-Allow-Origin': myDomain,
      'Access-Control-Allow-Headers': 'x-requested-with',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(payload)
  }
}

emailDavis.generateError = (code, err) => {
  console.log(err)
  return {
    statusCode: code,
    headers: {
      'Access-Control-Allow-Origin': myDomain,
      'Access-Control-Allow-Headers': 'x-requested-with',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(err.message)
  }
}

emailDavis.generateEmailParams = body => {
  const { email, name, content } = JSON.parse(body)
  console.log(email, name, content)
  if (!(email && name && content)) {
    throw new Error('Missing parameters! Make sure to add parameters \'email\', \'name\', \'content\'.')
  }

  return {
    Source: sender,
    Destination: { ToAddresses: [myEmail] },
    ReplyToAddresses: [email],
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: `Message sent from email ${email} by ${name} \nContent: ${content}`
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `Message from ${name} via ${myDomain.substr(8)}`
      }
    }
  }
}

module.exports = emailDavis;