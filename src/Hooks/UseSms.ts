import axios from "axios";
import qs from "qs";

const SendSms = async (to: string, message: string) => {
  console.log(`SendSms ---------------------------`);

  if (/^(09|\+639)\d{9}$/.test(to)) {
    try {
      const sms_response = await axios({
        method: "post",
        url: `https://api-mapper.clicksend.com/http/v2/send.php`,
        data: qs.stringify({
          // username: `nhorodinsalic@gmail.com`,
          // key: `7BDC6006-FC59-1FB4-96EA-33AD052AB53D`,
          username: "juliusnovachrono07@gmail.com",
          key: "AC9557D6-F0B3-0467-1EEA-5F0A560A7767",
          to: to,
          message: message,
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic 4B6BBD4D-DBD1-D7FD-7BF1-F58A909008D1`,
        },
      });
      console.log(`sms_response`, sms_response);
    } catch (error) {}
  }
};

export default {
  SendSms,
};
