select CUMULATIVE_SUM(computevelocity) from location where cnt= "S01228423177" time >= 2020-10-28T01:00:00Z and time <= 2020-10-28T01:00:00Z
2020-10-28T07:04:54Z 
2020-10-28T07:04:55Z 

SELECT mean("computevelocity")*1000 FROM "location" WHERE ("cnt" = 'S01228423177') AND $timeFilter GROUP BY time(1d) fill(null)

2020-10-26T06:58:34Z 0.3552153589000818
2020-10-26T06:58:35Z 1.217876189497144
2020-10-26T06:58:36Z 1.3644619549120192
2020-10-26T06:58:37Z 0.710430717800164
2020-10-26T06:58:38Z 2.7294705047158843
2020-10-26T06:58:39Z 1.0656460767002467
2020-10-26T06:58:40Z 2.126148500119373
2020-10-26T06:58:41Z 2.135516720783598
2020-10-26T06:58:42Z 1.7786122373251463
2020-10-26T06:58:43Z 3.075625924582673
2020-10-26T06:58:44Z 2.8464762442544127
2020-10-26T06:58:45Z 3.2025716058004727
2020-10-27T11:13:30Z S01228423177 0                  0                       0         35.1103008 129.09408   {"latitude":35.1103008,"longitude":129.09408,"altitude":10.739,"velocity":0,"direction":0,"time":"2020-10-27T11:13:30.000","position_fix":4,"satelites":12,"state":"ON"}      0
2020-10-27T11:13:30Z S01228423749 3.6776784703309207 0.0036776784703309207   191       35.104656  129.0959872 {"latitude":35.104656,"longitude":129.0959872,"altitude":10.865,"velocity":10,"direction":191,"time":"2020-10-27T11:13:30.000","position_fix":4,"satelites":12,"state":"ON"}  10
2020-10-27T11:13:30Z S01228427453 2.7492300643484313 0.002749230064348431    356       35.0959744 129.095104  {"latitude":35.0959744,"longitude":129.095104,"altitude":7.534,"velocity":7,"direction":356,"time":"2020-10-27T11:13:30.200","position_fix":1,"satelites":0,"state":"ON"}     7
2020-10-27T11:13:31Z S01228423177 0                  0                       0         35.1103008 129.09408   {"latitude":35.1103008,"longitude":129.09408,"altitude":10.728,"velocity":0,"direction":0,"time":"2020-10-27T11:13:31.000","position_fix":4,"satelites":12,"state":"ON"}      0
2020-10-27T11:13:31Z S01228423749 2.4901295207934564 0.0024901295207934563   206       35.1046336 129.0959872 {"latitude":35.1046336,"longitude":129.0959872,"altitude":10.867,"velocity":11,"direction":206,"time":"2020-10-27T11:13:31.000","position_fix":4,"satelites":12,"state":"ON"} 11

1603846847000000000
1603848647000000000
select cumulative_sum(computevelocity)*1000 from "location" where time >= 1603849421000000000 and time <= 1603849427000000000

S01228423177
S01228423749
S01228423453

select cumulative_sum(computevelocity)*1000 from "location" where time >= 1603849421000000000 and time <= 1603849427000000000 group by cnt

select cumulative_sum(computevelocity)*1000 from "location" group by cnt

SELECT cumulative_sum(mean("computeDistance")) FROM "location" WHERE ("cnt" = 'S01228423177') AND $timeFilter GROUP BY time(1h) fill(null)
SELECT cumulative_sum("computeDistance") FROM "location" where time >= 1603897200000000000 and time <= 1603983599000000000 group by cnt

SELECT cumulative_sum("computeDistance") FROM "location" WHERE ("cnt" = 'S01228423177') AND $timeFilter GROUP BY time(1h) fill(null)