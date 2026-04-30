async function getNumberInfo() {
  const token =
    'EAAdLlW6lFT4BRRGWi3vzubSxX7f8M8caYYuZCjgd01DeaRq5BnBxZCTym0cEUXXllZABh4y1172ZBmlyhCbNTnpwP0Kevt76Vwgk6bd99MZBUenMCukriaaFp9w2gMuxdUuJOopuElbl4PI8H6Ju9IuWIwOl9C5HkpA1Lm2sqElGiDL6MUBdbAEJnO6ZBiDRIaggZDZD';
  const phoneId = '853596591180846';

  const url = `https://graph.facebook.com/v21.0/${phoneId}`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}

getNumberInfo();
