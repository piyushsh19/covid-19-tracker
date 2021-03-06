import React, { useState, useEffect } from 'react';
import './App.css';
import { FormControl, MenuItem, Select, Card, CardContent } from '@material-ui/core'
import InfoBox from './InfoBox';
import Map from './Map';
import Table from "./Table";
import { sortData, prettyPrintStat} from "./util";
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";


function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setmapCenter] = useState({lat: 20.5937, lng: 78.9629});
  const [mapZoom, setmapZoom] = useState(3);
  const [mapCountries, setmapCountries] = useState([]);
  const [casesType, setcasesType] = useState("cases")
 
// world data
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data)
      })
  }, [])

  //For particular country
  useEffect(() => {
    const getCountriesData = async()=>{
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => (
          {
            name : country.country,
            value : country.countryInfo.iso2
          }
        ))
        const sortedData = sortData(data);
        setTableData(sortedData);
        setmapCountries(data);    
        setCountries(countries);
      })
    }
    getCountriesData();
  }, [])

  const onCountryChange = async(event) =>{
    const countryCode = event.target.value;

    const url = countryCode === "worldwide" 
      ? "https://disease.sh/v3/covid-19/countries/all" :
        `https://disease.sh/v3/covid-19/countries/${countryCode}`;

        await fetch(url) 
        .then((response)=> response.json())
        .then(data => {
          setCountry(countryCode);
          setCountryInfo(data);

          setmapCenter([data.countryInfo.lat, data.countryInfo.long]);
          setmapZoom(4);
        })

    
  }

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
        <h1>Covid Tracker</h1>
        <FormControl className="app__dropdown">
          <Select variant="outlined" onChange = {onCountryChange} value={country}>
            <MenuItem value="worldwide">Worldwide</MenuItem>
            {
              countries.map(country => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))
            }  
          </Select>
        </FormControl> 
        </div>
        <div className="app__status">
          <InfoBox
          isRed
          active={casesType==="cases"}
          onClick = {(e) => setcasesType("cases")}
          title='Coronaases'
          cases={prettyPrintStat(countryInfo.todayCases)} 
          total={prettyPrintStat(countryInfo.cases)}/>
          <InfoBox 
          active={casesType==="recovered"}
          onClick = {(e) => setcasesType("recovered")}
          title='Recovered' 
          cases={prettyPrintStat(countryInfo.todayRecovered)} 
          total={prettyPrintStat(countryInfo.recovered)}/>
          <InfoBox
          isRed 
          active={casesType==="deaths"} 
          onClick = {(e) => setcasesType("deaths")}
          title='Death' 
          cases={prettyPrintStat(countryInfo.todayDeaths)} 
          total={prettyPrintStat(countryInfo.deaths)}/>
        </div>
        <Map
        casesType ={casesType}
        countries={mapCountries}
        center={mapCenter}
        zoom={mapZoom}
        />
      </div>
      <div className="app__right">
         <Card>
           <CardContent>
             <h2>Live Cases by Country</h2>
             <Table countries={tableData} />
              <h3 className="app__graphtitle"> Worldwide new {casesType}</h3>
             <LineGraph className="app__graph" casesType={casesType}/>
           </CardContent>
         </Card>
      </div>


    </div>
  );
}

export default App;
