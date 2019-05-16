const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const { PhoneNumberFormat, PhoneNumberUtil } = require('google-libphonenumber');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => res.render('index', {
  numbers: '',
  message: ''
}))

app.post('/', async (req, res) => {
  try {
    const phoneUtil = PhoneNumberUtil.getInstance();
    const numbers = req.body.numbers.split(/\r|\n/)
      .filter(number => number && phoneUtil.isValidNumber(
        phoneUtil.parseAndKeepRawInput(number, 'US')
      ))
      .map(number => phoneUtil.format(
        phoneUtil.parseAndKeepRawInput(number, 'US'),
        PhoneNumberFormat.E164
      ))

    const twilioClient = new twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    for (let i = 0; i < numbers.length; i++) {
      await twilioClient.messages.create({
        body: req.body.message,
        to: numbers[i],  // Text this number
        from: TWILIO_PHONE_NUMBER // From a valid Twilio number
      });
    }
    res.render('index', { message: req.body.message, numbers: numbers.join('\r\n') });
  } catch (error) {
    res.send(error);
  }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))