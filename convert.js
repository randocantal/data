const https = require("https");
const fs = require("fs");

const query = JSON.stringify({
  projetId: 8869,
  apiKey: "xoDZzH2H",
  selectionIds: [188585, 188586, 188587, 188589, 188593, 188594],
  responseFields: ["id","nom","localisation.adresse","localisation.geolocalisation.geoJson"],
  locales: ["fr"],
  count: 200
});

const url = "https://api.apidae-tourisme.com/api/v002/recherche/list-objets-touristiques?query=" + encodeURIComponent(query);

https.get(url, (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    const json = JSON.parse(data);
    const features = (json.objetsTouristiques || [])
      .filter(o => o?.localisation?.geolocalisation?.geoJson)
      .map(o => ({
        type: "Feature",
        geometry: o.localisation.geolocalisation.geoJson,
        properties: {
          name: o.nom?.libelleFr || "Sans nom",
          adresse: o.localisation?.adresse?.adresse1 || "",
          commune: o.localisation?.adresse?.commune?.nom || ""
        }
      }));

    fs.writeFileSync("campings.geojson", JSON.stringify({
      type: "FeatureCollection", features
    }, null, 2));

    console.log(features.length + " hébergements exportés !");
  });
});
