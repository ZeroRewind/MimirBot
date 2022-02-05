const axios = require('axios');
const {
  JSDOM
} = require("jsdom");
const {
  window
} = new JSDOM("");


const { Client, Intents, MessageEmbed, MessageAttachment } = require('discord.js');
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES 
    ] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', message => {

  let link = message.content;

  //sort through content
  if (link.startsWith("https://www.fanfiction.net/s/") === true) {
      postResponse(link);
  } else if (link.startsWith("https://m.fanfiction.net/s/") === true) {
      let newStr = link.replace("https://m", "https://www");
      postResponse(newStr);
  } else if (link.includes("https://www.fanfiction.net/s/") === true) {
      let messageTrim = link.replace(/(\r\n|\n|\r)/gm, " ");
      let messageArray = messageTrim.split(' ');

      let matches = messageArray.filter(s => s.includes('https://www.fanfiction.net/s/'));
      postResponse(matches[0]);
  } else if (link.includes("https://m.fanfiction.net/s/") === true) {
      let messageTrim = link.replace(/(\r\n|\n|\r)/gm, " ");
      let messageArray = messageTrim.split(' ');

      let matches = messageArray.filter(s => s.includes('https://m.fanfiction.net/s/'));
      let correctedLink = matches[0].replace("https://m", "https://www");
      postResponse(correctedLink);
  }

  
  //FFNET method
  function postResponse(url) {
    let fictionId = url.split('/')[4];
    console.log(fictionId);

    axios.get(`https://fanfiction.net/s/${fictionId}`)
    .then(function (response) {
      // handle success    
      const dom = new JSDOM(response.data);

      if (dom.window.document.getElementsByClassName("xcontrast_txt")[0].textContent.includes(" + ", "Crossover") === true) {
          let fandomInformation = dom.window.document.getElementsByClassName("xcontrast_txt")[0].textContent.replace('+', '/').replace(' Crossover', '');

          let crossoverInformation = {
            fandom: fandomInformation,
            title: dom.window.document.getElementsByClassName("xcontrast_txt")[1].firstChild.data,
            author: dom.window.document.getElementsByClassName("xcontrast_txt")[3].firstChild.data,
            summary: dom.window.document.getElementsByClassName("xcontrast_txt")[6].firstChild.data,
            details: dom.window.document.getElementsByClassName("xcontrast_txt")[7].textContent
          }

          discordEmbed(crossoverInformation);
        } else {
          let singleFandom = dom.window.document.getElementsByClassName("xcontrast_txt")[2].innerHTML;

          let storyInformation = {
            fandom: singleFandom,
            title: dom.window.document.getElementsByClassName("xcontrast_txt")[3].firstChild.data,
            author: dom.window.document.getElementsByClassName("xcontrast_txt")[5].firstChild.data,
            summary: dom.window.document.getElementsByClassName("xcontrast_txt")[8].firstChild.data,
            details: dom.window.document.getElementsByClassName("xcontrast_txt")[9].textContent
          }

          discordEmbed(storyInformation);
        }

      function discordEmbed(data) {
        const embed = new MessageEmbed()
          .setTitle(data.title)
          .setURL(`https://fanfiction.net/s/${fictionId}`)          
          .addFields(
                  {
                    name: 'Fandom',
                    value: data.fandom
                  }, {
                    name: 'Author',
                    value: data.author
                  }, {
                    name: 'Summary',
                    value: data.summary
                  }, {
                    name: 'Details',
                    value: data.details
          });

        message.channel.send({ embeds: [embed] });
      }
    })
    .catch(function (error) {
      //handle error
      console.log(error);
    })
    .then(function () {
      
    });

  }  

}
);
  
client.login(process.env.MIMIRTOKEN);
