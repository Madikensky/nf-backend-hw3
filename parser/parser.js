const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const cron = require('node-cron');

async function scrapeData() {
  const url = 'https://krisha.kz/prodazha/kvartiry/almaty-aujezovskij/';
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const apartments = [];

    $('.a-card__descr').each((i, elem) => {
      const apartmentTitle = $(elem).find('.a-card__header-left').text().trim();
      const apartmentPrice = $(elem).find('.a-card__price').text().trim();
      const apartmentStreet = $(elem).find('.a-card__subtitle').text().trim();
      const apartmentDescription = $(elem)
        .find('.a-card__text-preview')
        .text()
        .trim();
      apartments.push({
        apartmentTitle,
        apartmentPrice,
        apartmentStreet,
        apartmentDescription,
      });
    });

    return apartments;
  } catch (e) {
    console.error('Some errors was happened');
  }
}

function readAndCompareData() {
  let previousData = [];
  try {
    const data = fs.readFileSync('data.json', 'utf-8');
    previousData = JSON.parse(data);
  } catch (err) {
    console.error('Error while reading a file..');
  }

  scrapeData().then((newData) => {
    const addedData = newData.filter((e) => {
      return !previousData.some(
        (prevItem) => prevItem.apartmentTitle === e.apartmentTitle
      );
    });

    if (addedData.length > 0) {
      console.log(addedData.length);
      console.log('New data');
      addedData.forEach((item) => console.log(item));
      fs.writeFileSync('data.json', JSON.stringify(newData), 'utf8');
    } else {
      console.log('There is no new data.');
    }
  });
}

cron.schedule('*/30 * * * * *', () => {
  console.log('Start scrapping the data...');
  readAndCompareData();
});
