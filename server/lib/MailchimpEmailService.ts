// Module object with one external function and one internal function
import mailchimp from "@mailchimp/mailchimp_transactional";
import { config } from "../config";

export const MailchimpEmailService = (function () {
  const APIKEY = config.MAILCHIMP_API_KEY;
  console.log(`Mailchimp API key ${APIKEY}`);
  const DEFAULT_RECIPIENTS = ["luke@digitalvillage.com.au"];
  const DEFAULT_SENDER = "chief@digitalvillage.com.au";

  async function ping_mailchimp() {
    const mctx = mailchimp(APIKEY);
    const response = await mctx.users.ping();
  }

  function createRecipient(email: string) {
    return {
      email: email,
      type: "to" as const,
    };
  }

  // Internal function
  async function sendEmailTo(data: string, recipients: string[]) {
    const message = {
      from_email: DEFAULT_SENDER,
      subject: "AI Buddy Submission",
      text: data,
      to: DEFAULT_RECIPIENTS.map(createRecipient),
    };
    const mctx = mailchimp(APIKEY);
    const response = await mctx.messages.send({
      message,
    });
    console.log(response);
  }

  // Public interface
  return {
    // External function
    sendEmail: function (data: string) {
      sendEmailTo(data, DEFAULT_RECIPIENTS);
    },
    test: function () {
      ping_mailchimp();
    },
  };
})();
