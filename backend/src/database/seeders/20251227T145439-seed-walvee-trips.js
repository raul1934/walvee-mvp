'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tripsData = [
  {
    "id": "e6693b4f-9ef7-488a-835d-2cd8d9e015d9",
    "title": "Trip to Rio Preto",
    "description": "",
    "duration": "3 days",
    "budget": null,
    "transportation": null,
    "accommodation": null,
    "best_time_to_visit": null,
    "difficulty_level": null,
    "trip_type": null,
    "author_id": "5ff3010d-aa86-46c9-9967-9777bdf0b600",
    "destination_lat": null,
    "destination_lng": null,
    "is_public": true,
    "is_featured": false,
    "views_count": 13,
    "is_draft": false,
    "created_at": "2025-12-27T14:27:59.000Z",
    "updated_at": "2025-12-27T14:52:12.000Z",
    "deleted_at": null,
    "author": {
      "id": "5ff3010d-aa86-46c9-9967-9777bdf0b600",
      "email": "raul19345@gmail.com",
      "full_name": "Raul Neto",
      "preferred_name": "Raul",
      "photo_url": "http://localhost:3000/uploads/5ff3010d-aa86-46c9-9967-9777bdf0b600/1766789123016_7dbd85d4-ec7f-4d48-a324-2161675308ff.jpeg",
      "bio": ""
    },
    "cities": [
      {
        "id": "d5d98abf-7f7f-4b4e-9bf1-399880b339e2",
        "name": "São José do Rio Preto",
        "country_id": "a7972e86-fecf-4096-b256-fce252dd7f75",
        "google_maps_id": "ChIJifctTGGtvZQRCSxkcPCwL48",
        "state": "State of São Paulo",
        "latitude": -20.8127115,
        "longitude": -49.376521,
        "timezone": "America/Sao_Paulo",
        "population": null,
        "created_at": "2025-12-26T22:43:42.000Z",
        "updated_at": "2025-12-26T22:43:42.000Z",
        "deleted_at": null,
        "TripCity": {
          "city_order": 0
        },
        "country": {
          "id": "a7972e86-fecf-4096-b256-fce252dd7f75",
          "name": "Brazil",
          "code": "BR",
          "google_maps_id": null,
          "continent": null,
          "flag_emoji": null,
          "created_at": "2025-12-26T22:43:35.000Z",
          "updated_at": "2025-12-26T22:43:35.000Z",
          "deleted_at": null
        },
        "photos": [
          {
            "url": "http://localhost:3000/images/cities/d5d98abf-7f7f-4b4e-9bf1-399880b339e2/1.jpg",
            "id": "be098715-6f2b-439b-8b40-f0bc161d7079",
            "city_id": "d5d98abf-7f7f-4b4e-9bf1-399880b339e2",
            "google_photo_reference": "AZLasHrtLc0RKEh_DEXbHJlhTnfszlL2LKioJQ3PrWB2uSJP7cP2l_zS4A8ONSMqGLZsoXI6pKjfKv8j3A3KnES04E32bsr57xB8Ar3kLn4SARPaWEkgBCT_JIQbAoYJZ12V63ZRFuoaBMt66UroTZqHQRI4riaViE-BPtzpYsHW59h6fq9NscFNcp4DFO4oJNHpAdHbHY4KkPeVcqO0kc2uCCUKt0AbGJPFxFtmstKm4zkFHZL8elPMawrs64gxBOezyCCgVYSrF1xlcNMOipVjeTw6n7cki69J4jko5G2AY-iErAXSBTCxTpxGXXMW9INpGnXIcaPhBnMETs9DcBh8sGG8FnQrmTsOsExKIoB0oTpwN6vgCTPtreK865Oa6CEMWYB4SeCpTaXX8tkbzBSy_Zg9f9u5IfV1Uc5RK8kk-VsrHW5v",
            "attribution": "<a href=\"https://maps.google.com/maps/contrib/104342994579464755536\">Ralph Schmidt</a>",
            "photo_order": 1,
            "created_at": "2025-12-26T22:43:43.000Z",
            "deleted_at": null
          },
          {
            "url": "http://localhost:3000/images/cities/d5d98abf-7f7f-4b4e-9bf1-399880b339e2/4.jpg",
            "id": "6dbbdb72-5139-48e6-aa57-b4ac40e9d97c",
            "city_id": "d5d98abf-7f7f-4b4e-9bf1-399880b339e2",
            "google_photo_reference": "AZLasHrhU08UxzHR6coJBQNg-cw7VViVLupXRbbiAkkff0tpL76T1AEvpPAEfqSIvDNo8czx8Z2PrycLr0mQGZ_d9EqNIp3UB_S1SV9aaEYJbxk6lWCfEUVRzFavouK2feMHplgsNgCXFfu3Lt-9NoCfLcB3saeSFs1yiqzyfHxJfE1L-6L3TYQG3DUm3zyrBvPjaLhM6avLklsrYwu8kCSDtB0SeROqWOPLub5df95-7m8DVwdJO_OE3M0X45v0RyMh23Z0bZq3QW02kFUWP-5FxRMSaHFBKq8N3DOzlgjG1iuSisPA_3xFhHqky-UEQjwH71bYb-NpP0Cyp4FlTQksRg0wK6wPfxSm8_li-6xbcYXO11yfTlBNWqcr0iji_8hZCDVaqhyjc3vD90LZ0ZBYpcyEQf8NX7Rd_6Z7H3mR04pwOA",
            "attribution": "<a href=\"https://maps.google.com/maps/contrib/104694050139203370271\">deusdédith ladislau josé Aguiar</a>",
            "photo_order": 4,
            "created_at": "2025-12-26T22:43:43.000Z",
            "deleted_at": null
          },
          {
            "url": "http://localhost:3000/images/cities/d5d98abf-7f7f-4b4e-9bf1-399880b339e2/3.jpg",
            "id": "054dbb38-6232-4d0c-8173-6e13b60654d0",
            "city_id": "d5d98abf-7f7f-4b4e-9bf1-399880b339e2",
            "google_photo_reference": "AZLasHp0ghiAcqRM3l9UQ31hBLryrAytPMxywNWWWhSyHw5RF4k8RUgZuGVpAMGY9n8TpR1v42O8z6wMaEDocYB2PtVElIOCFsfbfxHCUA-Oysf7oe4zH78eG_1S-c3h3eAyAxxR2XK_JstsAaIx9H1YXHc_CLl0n3FF8lVIqyj0IrA5QQIESRcEMrOhOcIRXeS3bIUiuf_se8Lq1-hZTa9qWriCg0oOGIeoqKWjbhyGnHL7JkUdkpABZhJLvpRs62J2VCn7Wrd7leV7JmdY1O2Wwtb6ATHiEGjgrKuOi3nxE7FzO0FO2JE8Hft2QB-yrZHRiAlnPcSR8KBnfAM2PBy6aOswwpG2TEYiwJ1VpBNVvEx-WpQnYtwaPvLC7gSK2hXkRx2JZbZRSrJ5xrnzTu6znJf3RQ8yMbjSRfRLqLm7Qs9nOw",
            "attribution": "<a href=\"https://maps.google.com/maps/contrib/114756773755176421759\">Paulocezar</a>",
            "photo_order": 3,
            "created_at": "2025-12-26T22:43:43.000Z",
            "deleted_at": null
          },
          {
            "url": "http://localhost:3000/images/cities/d5d98abf-7f7f-4b4e-9bf1-399880b339e2/2.jpg",
            "id": "e1a75a8c-603d-44bd-962c-11952d37ef28",
            "city_id": "d5d98abf-7f7f-4b4e-9bf1-399880b339e2",
            "google_photo_reference": "AZLasHo8s4pJzCaxPcGH9sNZ-u56PB9HK3pM9AcrfYD6RESnNhqM2XhfQ_E9FA6SuWOTNMw_rHjB_O1NimApm6FJdP-qOAgz2-uJmfKi5tHCMZHH5pJYYTLOIVKesPQNMAkEM9lTI2bxrntODxMN3V-9s73ZDmhXEreK-6JVkfOhkMvOKMP_TineQP7w-yaByf4ojTSqQ7aJl_-BBytvsDJPr-vXtAbARSl0OetmuGDiCi7xOZbruKsy85hYrdGRDXrkH7EtCLXjsQ-QumOhhJghE5K8UPLKwpczoABKXN_H2UDvu_7sKFK_i70HzQka_55SD2fEU1RWypwuXGqk-n-T1gwFouWH9iiUP3_u-_ZGG_MBAIzFGWL-0FlnYEQz5N65wJvE8vTxCGkREyatuqrKYM6DdZZMRvLekxNXQEEVfg5JWA",
            "attribution": "<a href=\"https://maps.google.com/maps/contrib/104694050139203370271\">deusdédith ladislau josé Aguiar</a>",
            "photo_order": 2,
            "created_at": "2025-12-26T22:43:43.000Z",
            "deleted_at": null
          },
          {
            "url": "http://localhost:3000/images/cities/d5d98abf-7f7f-4b4e-9bf1-399880b339e2/0.jpg",
            "id": "e06729e3-dd54-4a22-b778-135c249b04d4",
            "city_id": "d5d98abf-7f7f-4b4e-9bf1-399880b339e2",
            "google_photo_reference": "AZLasHqlqKqHESsvrooj6DF6qybFfVbGLoUZX0hvpLYaeLC6GXqn_7NVX5ZYHhJZzIHj-AtRAneDeq8jv1fLUZcgZ9aCqcI5m8tn-5BrgMPEgfs1XFEysUmT9_ST7zWpll5vZ8u-UNhLa7XHzV_iuT6C6lF-ZuUpdZvdEbNVzwpI99lt5xKwGlqNXmUtvodyDQE6eCspje0cBre9wt0WMFLSQWAisOscW6iNN0V_maQB_cAgGre5cimp_nY2ZnMaXcboCyr82tfS7YCtoqMFBHNfOVVHa7QluRccnxj0uRznhoSsxmK8mu9n0_3VieUtn7jpTF8lqjY2lA-8OaYBmHjkaPMaF5B0xeZB6gkAD86hT0zRw0kWM_kDt7Ha3oQK3fZuhY1YKKlEJYEBamtnT7xGpIf8EjOaVFbgoyHXtA78WsSqsw",
            "attribution": "<a href=\"https://maps.google.com/maps/contrib/104342994579464755536\">Ralph Schmidt</a>",
            "photo_order": 0,
            "created_at": "2025-12-26T22:43:43.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "tags": [],
    "places": [
      {
        "id": "c2e4ed4a-b9b1-453e-9caa-fad75e3964db",
        "trip_id": "e6693b4f-9ef7-488a-835d-2cd8d9e015d9",
        "name": "Park Children's City",
        "address": null,
        "rating": null,
        "price_level": null,
        "types": null,
        "description": null,
        "display_order": 0,
        "place_id": "a4276846-e19e-44b2-bb4b-0de2d4bf35b3",
        "created_at": "2025-12-27T14:33:50.000Z",
        "deleted_at": null,
        "place": {
          "id": "a4276846-e19e-44b2-bb4b-0de2d4bf35b3",
          "google_place_id": "ChIJ19moSpetvZQRNUCUUDgCCy8",
          "name": "Park Children's City",
          "address": "R. Daniel Antônio de Freitas, S/n - Distrito Industrial, São José do Rio Preto - SP, 15035-540, Brazil",
          "city_id": "d5d98abf-7f7f-4b4e-9bf1-399880b339e2",
          "latitude": null,
          "longitude": null,
          "rating": "4.6",
          "user_ratings_total": null,
          "price_level": null,
          "types": [
            "establishment",
            "park",
            "point_of_interest",
            "tourist_attraction"
          ],
          "phone_number": null,
          "website": null,
          "opening_hours": null,
          "visible": true,
          "created_at": "2025-12-27T14:28:13.000Z",
          "updated_at": "2025-12-27T14:28:13.000Z",
          "deleted_at": null,
          "photos": [
            {
              "url": "http://localhost:3000/images/places/a4276846-e19e-44b2-bb4b-0de2d4bf35b3/1.jpg",
              "id": "3b909658-8939-42a2-a150-978ff1d5705b",
              "place_id": "a4276846-e19e-44b2-bb4b-0de2d4bf35b3",
              "google_photo_reference": "AZLasHpmmJLMpf7lZVRhdeMyMhfVdjUXlkkHv_Atcc5_Thhy62psrTCBtI2z9Dj8c2ATmyNvaBENbTjZJcX50EECI2zPBeGfFp06mIfMa2AS6ox4MJV1yduKPU8sWY7PUCCd_DbDWSGzEsfAjQ2jCk62OHOZ_VJn3OYSkw_jvxTT9RGtJiLkCEc1JZ-Id6tBSfWOIT4PpsLRuHTDwSsS8Vn-98qs1zRpqJeMprZnBO9WZ4tMSnjwEo3BazpmzGe18KpKwN_LcaGtACILofovux8oHP0jpVR9aaOpmxze4uRLx_CUzoWGar82GhUt_-FxI6F8HAJuhR5z4_1lV0BBWEW_wULc_lxGSI7wAFAHZa8caPQAwGa2_fqlaAV00oZ12DJy_h__8_euc32IWbRrbmhpUECdA7PmlH6hZ_MBVd0kOa71tX_6",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/116810579471001782090\">Gersino Vaz da Silva Jr</a>",
              "photo_order": 1,
              "created_at": "2025-12-27T14:28:14.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/a4276846-e19e-44b2-bb4b-0de2d4bf35b3/6.jpg",
              "id": "be77eefb-4a09-49b7-b0e3-ce1afdf2ad41",
              "place_id": "a4276846-e19e-44b2-bb4b-0de2d4bf35b3",
              "google_photo_reference": "AZLasHpSsFHEbMe2hK_eClNYO3TTI_TeupwGBIjzkBV28ReAlSzPzPWH16ai8Rf8x65m7lVyfU9yUtma2XQdyFEgQLNgZ6cL1vtpjauUyq77AtvnJ3CdBd9kN31i9eaKY8m1VrtYnswe1Z26W7rf9AnJkydnP9tMiltambv6jrzoVgNoAN7UPfzCOMCRk3xuo-bySAz1isTW2eeMXUQAXLx2JoAyowGygzPNMBuq6s4S6h-AGbCn-b08V6cYhnVQFR5XwJyjQ-SGcdZufVN8czXk0sKvaf-p8-VRnSWgsa5yZcjEh4qs_ALzsx8DWcTiurQUXA9_-DQNzNsG2aoBCWihvoAHEfqx3-rqFpWmQzTVXwtZUlfbbA2-LK9tKjw5Ml8Rn_3NszKCk765rZ9nTtHsbylw2cqLf1bwD76qCp_DpG20dA",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/115335667954139424466\">Jair Fernando Remijo</a>",
              "photo_order": 6,
              "created_at": "2025-12-27T14:28:14.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/a4276846-e19e-44b2-bb4b-0de2d4bf35b3/9.jpg",
              "id": "e0a55a62-ae8a-41f6-bf76-f20e0be3e028",
              "place_id": "a4276846-e19e-44b2-bb4b-0de2d4bf35b3",
              "google_photo_reference": "AZLasHr_191irO5Is8bcXlusZfY7T6ulrN62bDfcPP7b3ub2GEkjTV4ZubLWNa7x9ADQl-EOYEhcYVM1zAKYtlhr5J2IXMfc4FTYTLxvmjh_1IVfIE-ZsCP2Km7KP0qEf9mGKKJJXNUVF-seBTxWWEqUNUnHUY3TDhV_f0Rk2x_Nnym8QeTxmbAXo7TQJbDh0XdSGKeIQ1MbNY3crvqoOQXbJS-H3bu3jUxtQr-iai6akeNbFjSXiUVwbX2X6BJvOis4SjLNZzY4BBOE12xT3y7hXCBxOOUOAc4LIUhKimEDBzYFcAwbo6og2VJQVmvW3nwZ48lyYevxLKHU2Iv87dfYzxfdIxbCTh0vxH7qaIP8JxEeuUAcWh041hrJKfVO7Lc8oqT3KDxmdeeDPJhzu_oA05do16FAf8MoBxmfCuAwWzlqHw",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/115507417623515077949\">Vanessa Printer</a>",
              "photo_order": 9,
              "created_at": "2025-12-27T14:28:14.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/a4276846-e19e-44b2-bb4b-0de2d4bf35b3/2.jpg",
              "id": "e8e2c98e-1c4c-48a8-a95a-226be6d7f645",
              "place_id": "a4276846-e19e-44b2-bb4b-0de2d4bf35b3",
              "google_photo_reference": "AZLasHr2A0s2gVmmv-Vjb1NaCcrEOgzrYyzhgWNDcTToqQT4F1bw5nDwWaDnPgiz7RmHR5jmLHV0L9Wm21XpnJvH4iFnaDdv4-ygUA2q5nL9rbNKpNHO_gppdlaPVrG-MgyAsa55h5ijPh0i6aWOyhuUmKjJfgKrBRbzZLM8DxDRXmUbgiyu4ZyzzHWEv0rUG8B7oU_JKLfFM8Eg4FO_s5f0v-56RtVSZPiGmkWLF6ruKIlCk2uDOfBYIMwAJ5rZwIKKTxEZWtE3capkRxjroRefkNUybmY18DldCMXk3hguYhZxn5mE42sUn3SFy-a3NDEnUpxnGqJUXq1A_S3ojlvRurjwxKs8mVBeld82eLnxgspjMhKm0z07k51GKW20qMQLBGN5eIv_M4Nn8aS9kIHyilTvqVy-2p8TTS9n4_UUT8DfKw",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/110979235703598026560\">Kleber Leandro</a>",
              "photo_order": 2,
              "created_at": "2025-12-27T14:28:14.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/a4276846-e19e-44b2-bb4b-0de2d4bf35b3/3.jpg",
              "id": "0a11a76b-5f86-4f61-bb60-6b880b341a6d",
              "place_id": "a4276846-e19e-44b2-bb4b-0de2d4bf35b3",
              "google_photo_reference": "AZLasHrhlHH6E3vFvKVJRn9310F-WJqm7ll_bTy8vjRWT0VPKgyzqIFiRwwLXkzCFcHVlJ3DgA3l1_ba94OkHSj5Ap3sr6DoSyRadFfkPoudVRcUFg-BSD4BclDlKFQJfnuks5XccFudduJlzDs6TcAe89YMeiGwkDOWYgJX1KozBWCN7iOaO4yvvV8nvAKFB7M9hExyxyvPb-HFUCoDcvubCtThkRfACsbkNT-GtnfVQ__pG9RQcI2oCK66PcMDbpLytGLi3uFFRmtxrxf-nje0NV1Gu_-xGw5Qft5otqBggpoP1k1LH-fuTkIYghB4jVSNOXqIoPhcZTJsq1krjXFVpKbVtJKYEUqGAxcXwk3T2pilHw91W5-UKoRiEJqx97gZKNTe9HBiJWfZ6JNPckGQcKnxIQCZhiwTFi1BHXxu3GqWBw",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/116271723932699807367\">Auzeli Salomé de Andrade</a>",
              "photo_order": 3,
              "created_at": "2025-12-27T14:28:14.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/a4276846-e19e-44b2-bb4b-0de2d4bf35b3/8.jpg",
              "id": "d3deaa21-5b7e-4f48-9a33-415b78d839ef",
              "place_id": "a4276846-e19e-44b2-bb4b-0de2d4bf35b3",
              "google_photo_reference": "AZLasHoEf14nI9t8wk4puQGa84e4jhRxoszZA1fxjess1NRIgmuhIQs1Q3XPiZKYAqH_CTrwhEGlZ2IGP4vhZ4nC_38g8RJFm9L63RK4sfMh9uQ0ufFVMS8Zl5c1_2dov8MDc7KEeUDkRNsKpth1R3bIU-rh7phwlXePzao1UKvrVJK4TtzEnVEnZKzoZHTc6PRkrWrUxsagZHceIqbYRTK-3zmkXTIyaB0E4a6gzXonBOFbryFUJUuL_PX3VHJd0rGuHrg2FAOX1yLYon6ydo9ByXBgQwODR0sBTSEsUfMKp8ygqT2bSGBXxhPdmWBiWGoFSe3RrdwFkbSpqaTMQjj59wnK8wtXdilE_lm1PI_FveWDVqoodnAGGLBkhjyjK8kwofuJq8RQajfKZRAxbDSfD-gEiUYeizAS2A2eHma9WXTqgw",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/108426636190995961987\">Natalia Carraro Vulpini</a>",
              "photo_order": 8,
              "created_at": "2025-12-27T14:28:14.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/a4276846-e19e-44b2-bb4b-0de2d4bf35b3/5.jpg",
              "id": "2e9f6b65-25e7-4a16-ab8a-155f05fdddfc",
              "place_id": "a4276846-e19e-44b2-bb4b-0de2d4bf35b3",
              "google_photo_reference": "AZLasHosmIyOHANpvhxxO7fsfKmrEXFNMfiNzxXxWZD9vMv_q6PJtkXEiFRmX76V-0wNYMUHFueboYBLgkBqpez7pu4dj-jONpO6Jh1m_ZqjmsuXxyyL8X-SSnry51OD3QHrwmNdnZe_qRYV-FOLpcy7hqGb24ogDBkoZQHBEtH3Ei9mt-XcUhlmUNRetT0qifsmkFHRCCUuLVad9yYTgcksjEraZ3Pct7EGA7XC8sB3tpmGVL_mvXKUIr4WJ-bz7a4me2K9PRYlUGsls_pjN5bxyiQIEtgr-5wRM2SMSB1LUiejwqSpF1YNSRGCFAjhHzxEJofHieWqSfWtGFa-SfcmrzM2QQYLKQXQHowjmORUH4a0Q7PALiy0ppj37Z3vTkcLExHF2QxzcNJqgXMBn75RtBireI-gsuItDAuHLMYbDQy_ce1W",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/101225607361123112076\">Renata de Freitas</a>",
              "photo_order": 5,
              "created_at": "2025-12-27T14:28:14.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/a4276846-e19e-44b2-bb4b-0de2d4bf35b3/0.jpg",
              "id": "a1726c74-ac15-45a1-bd4a-9311ac3edd64",
              "place_id": "a4276846-e19e-44b2-bb4b-0de2d4bf35b3",
              "google_photo_reference": "AZLasHoYHNnqmXLtPvvTNJVQo5O_uINV2hv9DTZnr4fu4Gfkx7rxfSJGG2qmTaSMXrvnl4Pz5i-UG5mgHYTdeyi0aEaAnbDl3J5bQMpCSIrk_zaHwq_0Imgft90o12bq5lLTI895arEWHNYX_G129_kPuF0eb4eRSL-QiIGqtZiIYFbpEIraLFrAFz9XPUhDz2moazW_qY7YUoLVEYZaIWO4RNRlGqCvIFZxolCuMjh_g_v21L4AIY1-b1tCywht9x9khE08BGlpuRPyzAvTpU77krA3tAoIHVG_8hmIo5q3o7T_9qCCdYHS9__6Anc038iYhKYyV7d-h51gJ-kXZL-rJQnugJFZcNi7ySUk5fbSK0l6HMrqnNGL59NXtW4C76GSycLQ1g34Ol01wVaf2plRYeLpd-7TNCxatMQqAk_f2Nz2Pw",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/106866421557524907537\">Lucíola Ribeiro</a>",
              "photo_order": 0,
              "created_at": "2025-12-27T14:28:14.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/a4276846-e19e-44b2-bb4b-0de2d4bf35b3/7.jpg",
              "id": "144e73a9-20e7-4d7b-aea6-a3c8334dd967",
              "place_id": "a4276846-e19e-44b2-bb4b-0de2d4bf35b3",
              "google_photo_reference": "AZLasHp7AhzKiCXfzT8OTUiYGHZp0Mv2d2QZrUf7DIMfbcdhruluqGMVkIPY6fdE8uBHLX3KeeysAewFwJCe3MFZkyjL4Kvfo6aGou_r_41yLTWBxR4-znVpLRtpLyUPKSjAUdE3FwhZmN9pLph9qoY5t9O8abyIH_0LpUtpb9JPddxXL2PjHzoILVdeyqGMeiZV8CCroxIQKDW35fEIougiJyqaLmfVuph35oKcENU67OJQAGQYbny_YMGohnzOSC41oJ3VXEHtz6pGCn0aZNGPSBpUe4Siytc7tgJPVNpCVd_YvDPPFTvoMgHGILfvl76ky_glJrGa2Grxqtl4S4TPN7Ah8eIugMk4U8ET_lnOZVSLG41IRDtpdp8WPNwGKevI2RawMz4X166p9BMV-Ce_Louu7Lc8sflVMyMb85hnFY3M-g",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/110272941158750512519\">Júlio Moron Ferrari</a>",
              "photo_order": 7,
              "created_at": "2025-12-27T14:28:14.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/a4276846-e19e-44b2-bb4b-0de2d4bf35b3/4.jpg",
              "id": "54c710cf-c293-4c4d-8850-8a9d3b3153c3",
              "place_id": "a4276846-e19e-44b2-bb4b-0de2d4bf35b3",
              "google_photo_reference": "AZLasHpLEuWsJWC2CWQHQcaY2GFgj6JOOxVcZmBGddeqEbITTgscfIyTzYQJrlmgHDLLE1DUNfHohFJRvskW3VE3ssB6f_CMnjL7Di_I6a1EvknrACv_EZv8t-qBsRSb59BQADlmFYpEOQ_aVOyWqFYUElti5I_zp5zbKjMU0dJHjd9WSHeIKzlwT1IeCepX9H0R84L67oN0uMcrF1aHu72tOv3lpcnNZjTuxzbG8VWTfUaRYxIOiMJxz75C3KapxcTPzmx3vzO2XGrDVc3hMm_yJfuFYfGkHGhH22pWQJixOMm8j3r2Qk_A0R9g4-jLm8RdoHsMk5ae1hWZs9xwFOyTjKRu2rma1UDlYKvCO6q9_h_ysCcjDVQ-TbawNAo5jBKIiTG9HjiUV0E0e8Bub20cgIhw9L8aZOnzg2SLI_cGjB7poe6p",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/101588590867482650178\">Joao neto</a>",
              "photo_order": 4,
              "created_at": "2025-12-27T14:28:14.000Z",
              "deleted_at": null
            }
          ]
        }
      },
      {
        "id": "886817b9-592e-4534-9149-3a579f7b7bf5",
        "trip_id": "e6693b4f-9ef7-488a-835d-2cd8d9e015d9",
        "name": "Parque da Represa Municipal",
        "address": null,
        "rating": null,
        "price_level": null,
        "types": null,
        "description": null,
        "display_order": 0,
        "place_id": "a894ffa8-9e5b-4c37-b2e2-2133e12d7fa0",
        "created_at": "2025-12-27T14:33:45.000Z",
        "deleted_at": null,
        "place": {
          "id": "a894ffa8-9e5b-4c37-b2e2-2133e12d7fa0",
          "google_place_id": "ChIJ3YenoldNvJQRAP1vZoHIDTM",
          "name": "Parque da Represa Municipal",
          "address": "Av. Sabino Cardoso Filho, 2520 - Jardim Estrela, São José do Rio Preto - SP, 15070, Brazil",
          "city_id": "d5d98abf-7f7f-4b4e-9bf1-399880b339e2",
          "latitude": null,
          "longitude": null,
          "rating": "4.7",
          "user_ratings_total": null,
          "price_level": null,
          "types": [
            "establishment",
            "park",
            "point_of_interest",
            "tourist_attraction"
          ],
          "phone_number": null,
          "website": null,
          "opening_hours": null,
          "visible": true,
          "created_at": "2025-12-27T14:28:13.000Z",
          "updated_at": "2025-12-27T14:28:13.000Z",
          "deleted_at": null,
          "photos": [
            {
              "url": "http://localhost:3000/images/places/a894ffa8-9e5b-4c37-b2e2-2133e12d7fa0/5.jpg",
              "id": "61318e5a-2de9-497e-a378-a29e6f48a108",
              "place_id": "a894ffa8-9e5b-4c37-b2e2-2133e12d7fa0",
              "google_photo_reference": "AZLasHr62NVLS3ANauVD1lQ-THLevnQA9qEwOulENB81H8cekGLEuW8nHPe1tQ1DDLYohGG-VKokKJaLCOjzEDii-kjXErUE09F3DbfgejKWB_NlvO8W5p7zf3pewWWnRf51cxFRC99xYyDgtvjm1cJ-NoThgVx8TNpcuhd1Lbgw2sBmF0CouxGap5PtgN0O_srzxSRJnLclrf71Z1QpzVyletE4EJO1EJcKd5pWgBtHBK45sXDPqE85wR7TwE3BxQgwTmz7D5M6kf-TdS_486q1RHgLr3D0yN9GY1SoJOuzhRjf4RFruFVl8zngK_ZgFAzmzF7JgHu1o5XqksQ3G6T0yd8gqRQtm2jVeAXXbbBnpJMM9p4SI5AlapDZZzDQebHmh-G5DLSK3-FsBUFDXkZ4s0VrzTS741J-A_iNLBX3vWabfw",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/102430688037762305973\">Vinicius Ferreira</a>",
              "photo_order": 5,
              "created_at": "2025-12-27T14:28:14.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/a894ffa8-9e5b-4c37-b2e2-2133e12d7fa0/6.jpg",
              "id": "6ef68ef7-fd22-46d2-aaa2-3693400df352",
              "place_id": "a894ffa8-9e5b-4c37-b2e2-2133e12d7fa0",
              "google_photo_reference": "AZLasHrgVoQWLNYjLdBLy4DO-K8Wz_d4uqqdLe2WfVysLY-xoujlOH5_TU4jTfKeyt2k6lXa6HtoW1foxPk4eT_xtLF_JAVRWPqFzs_cvxaV6mr-nyGlP35cmMtSW45IvfooTb6CJxL-0j7Oe1CUPGVGEuL12u0Ovwhtc1Brh3nHhrNRimysvEQuBaIU3ZIinsVVeInReSwpfew5huRY9Ntr-bip9KREqiISC59yTe0edwinziUWLgHwYolUusT9SB_1v6yl6gEev4ywuy5QELVWP8PWo6ekjY7gvjeei4XC_ktTRgOKlC5matOEUZcGp37jnJQ4C7pL7FFjLqHtX4adLYY5a959zt0D_TXCZzFGxBNUycQ3QDxzFFuJdt58ydJwPb6E36Z6e3gQve5Ogmjh_OCRssSBo9aQ7wRmNBqCHGYZXA",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/101260234438980872644\">Paulo Cardozo Checconi</a>",
              "photo_order": 6,
              "created_at": "2025-12-27T14:28:13.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/a894ffa8-9e5b-4c37-b2e2-2133e12d7fa0/7.jpg",
              "id": "da724be5-933b-4dde-8b9a-34343ef86415",
              "place_id": "a894ffa8-9e5b-4c37-b2e2-2133e12d7fa0",
              "google_photo_reference": "AZLasHrkEonFijMqmWXj1zaPGRscVFA7y-VLvah1HLoUa-ND26rgDx8K_Cg8YQ2KlEizXYdQVsOEtxegWik97EREDRXreoPQY7LNUQxpgB7wKUDva3CGDnfhOsC15xs3uDFYlq_TMdpQbiYUStuxS1eXkCCjAQvVHgdKDFP7yQPXgMZy9rXfyPuOtxCZC-alUwOp3Wqw0MTSZIm9V2vuVQ_KRJ_BGocHZZZPOTUZXInveOdNfje-0rvR42NTqY7u55si0JlHwzUD3JHy5qek44-ZdORkl7aV_zZab5vWY_y5IKtMTeKTSkogL-s77q1Kq4pymGNWFOo2PKQTV3rqoBKJOpB60_aspWUK4nislW9dwWtpCC_cvXK4Wo7vSMHIq_DLyukHRuZ8lgoV-c9_1mTWk4xuJ2FqZroWhGD7u7WRZgtMv6U",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/110028756405083495024\">Fernando Schentl</a>",
              "photo_order": 7,
              "created_at": "2025-12-27T14:28:14.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/a894ffa8-9e5b-4c37-b2e2-2133e12d7fa0/0.jpg",
              "id": "e9a10c44-909c-4a1c-a1c3-746e973d7326",
              "place_id": "a894ffa8-9e5b-4c37-b2e2-2133e12d7fa0",
              "google_photo_reference": "AZLasHo2Dj-PtqnZV3wHnXJ9JQDBVbQs7JGvOYhhFiCymg69WDGfOxaA7WokbGdgssX2hmxPQhKTSUNIwhyrrpBm1ietZvx9IwwsR-nz35vTmUhXiFetFFlBwC0iSGeNJIlUNRXplcgtAgPlJQrly8a37ah5k5smys6QS5589IpYG9o6NhA7qUXejcMIXzfOPxX5xsbXAFglfKU5P91cW4sPMG4KJ0IGok-7xoBwNknQGrcNBqEF5uoNVRxCM1HSrAfFOOYGi4qAewgf9U-GlhyutrO2qNgZGLFAUH60Ji9Q_FaGcL8AqGlWBAR86kT8O4UwWDW7VNDb0N6CuO3E1AO_f70BCC3ypWTE6pw_xSiF0L3GkO7bprOn8Llb9gzv59s0R0B7d-54bZ2vTu1qOrHm_sfN98sVvdTCuSzWlzlEVc9tQ2xF",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/117541544358691028462\">Paulo B</a>",
              "photo_order": 0,
              "created_at": "2025-12-27T14:28:13.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/a894ffa8-9e5b-4c37-b2e2-2133e12d7fa0/1.jpg",
              "id": "fa314714-e329-4bb7-a12b-72d81bac0c63",
              "place_id": "a894ffa8-9e5b-4c37-b2e2-2133e12d7fa0",
              "google_photo_reference": "AZLasHoNKJrj4o3QydAZZ6J1nDcI3eFYH6UjgUFelrDeroZriLiUndPnIPzD2Uhw37ictNzxTAkhqz1WSuixw4428iZiEsqyrwxSToFSPFvQdnI4Tw2-lKPZhFFBs0o084VQVOQDK8eAM7YxKX94n7pHZNs3QfDWurryZXLxX5d_qz_Ir_KfJvypDLevc6LkFluArygOXfans7m5XRvZsZq4M-KA7iRbFd3lunjOSWilsp-fxnOV0ESqNXsRb4pzdhge5Mwb9wyCAWV7dnf1QW3EzTxweLULZvqrP_7tkZktKQxde9J0d6kR6mIjktKtQkmRX7ARTnQ6DR-X28PoVq_l9TgGjhw7YmPg_Tx96M1rfk1i_gz9LK-VqUtsrztzRYFFvR7r3xJvOyNrGwpazvqAENzDi85k8K6QD_-Ah0JPk05vPV4C_Cpa2wP5BvcZxUgE",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/109474152394700218354\">Vinícius Paulino</a>",
              "photo_order": 1,
              "created_at": "2025-12-27T14:28:13.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/a894ffa8-9e5b-4c37-b2e2-2133e12d7fa0/3.jpg",
              "id": "a49338bb-bf47-47ca-8486-934b101a69e4",
              "place_id": "a894ffa8-9e5b-4c37-b2e2-2133e12d7fa0",
              "google_photo_reference": "AZLasHoW0M_fn2V3_mdLnSTIrQuUGnWtJ_My126F6j2M3_wHTfafrNp-87Dq2dZuV6tWfKTtaRSsNBIErypKMIAnGM3FSpkHZHb_sZyeSfpLt79hXHhrhYqmw17J_W1v9-pD6dUJA4uLwqpGyS9-lGkBNqHk8KTeTWek4jcvPO1lZRiyqmEB_6tTPOESVs2bNOZY4XdkQz6lGMxsSWfN2U-lwfuz4vNIpgwuUmkoQsAlWSv01wcG53DdNTwS78HjQ5rCOz9YU-BhhmeCBMpwTG2KD8xuRJsflsXq58Z7VJnrNnjvDyrggz-iiiXkEYBF5D_KSVKPF7hp0c-A7jIHKk0_eve6yC0K6cpQ072mCyxCgItwdrQtfSVoZ4D3EKPCG2HKiWV7Kwmvqcvsdw_F150uD-YpbRxtSaGMaFKjatBxKFjMRD3A",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/115648288298352099465\">Amaury Movelero Garcia</a>",
              "photo_order": 3,
              "created_at": "2025-12-27T14:28:14.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/a894ffa8-9e5b-4c37-b2e2-2133e12d7fa0/8.jpg",
              "id": "6376469f-8dfb-4092-b3a1-bb5e70f0bfee",
              "place_id": "a894ffa8-9e5b-4c37-b2e2-2133e12d7fa0",
              "google_photo_reference": "AZLasHpdBh-H9VLWxuqIQw0BLPQ8yFUryEsj7OtZMOP3lC9X9o9PMFBzWQAlVUC1pYYtlR3N7SwhOcnoFFKJP8TQ2pYbQ96fJDvPl1IhuHcc4QIRuQP9SJ0QQtXxXLwb9ddF2vKX81Y-iW243IaCnryE7V7jfn4olImz7TRNacnFkz6xkgQJvfXQbC6f-y_B1ikJ1zlIantrjM9wcvWXIlOY7sLo21qvdfMPuY3TPnEPLaCwPTuxEZE43HYZn-BGYVpP0q2AmazGX7QTKqiIQCBsXPV8ET8Gywwz3YUIf-yg_Ef8sirlakElgg6dR_gdhzOB-7zEYh7hMxLKpoG2TyN-WfvP_mL5Bxge7W0EbfbUFMAyk6W0bcB413F10AK2bLyw9y7dIuqlCLVIaJyuz8BNY7PWXqJngdCg_O08lPdjDhE",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/116757618921712841300\">Giovani José da Silva</a>",
              "photo_order": 8,
              "created_at": "2025-12-27T14:28:14.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/a894ffa8-9e5b-4c37-b2e2-2133e12d7fa0/2.jpg",
              "id": "c4050df3-5aae-454e-8f1a-7dc403492b27",
              "place_id": "a894ffa8-9e5b-4c37-b2e2-2133e12d7fa0",
              "google_photo_reference": "AZLasHqrhmLTw4cEAglcxHqKRpS2bsuBNXvAmfz_poEk9WF7hbXF17ajytc9bZNxc1SoxbEvWSYWwkqI3nrQG9Tw-NqbcsKf45oPhNl4F5cPexwZeLYPxJzkL9zy8MH4nt-RPL6p7IhzJru7bkP0cSdBnWMGIiOpI_5OLpT2Lj_P64RSVlMdnDs6bvTgkOErVtT8CzKSh2HJWRq3c2fuqw55LNVe6gBeNiky6ooJ7rCQAIcJbENhK2xDa8_OfJPwXW5CIOMTZLTmVIcR9sl7bhaYghFPN1_YwEV6q7twYnSXMRClx_tw0zZiSkrJmiDf87GmGhMy1C6Lwbnr8gB9nahyAzTwSmDVrSgTb08QErmAQOAQbg3OAI0xncDPZqYKkz5Uu2IaiHWzWOkaDvj2LVf7_o_KtR6_96_mOH1Qwdz0nV_MbA",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/112992712377168926988\">Romerci Rossi</a>",
              "photo_order": 2,
              "created_at": "2025-12-27T14:28:14.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/a894ffa8-9e5b-4c37-b2e2-2133e12d7fa0/9.jpg",
              "id": "c76e4a2e-5e98-49b7-ae08-7883b5f59a19",
              "place_id": "a894ffa8-9e5b-4c37-b2e2-2133e12d7fa0",
              "google_photo_reference": "AZLasHoaxG_aywxkhC9KsXtKatr6YCBkFb7oCJFTIl691ShQlhm9I2IG0ZgobV3jR8LFEehHlW7_Tn9biF62QbX7_Y7TIRGpDNZJCecwZdOOtce_b-Y8dkgNz6tmAI41gSLBxw7Lnwoyu-xF_mEPaXOYXpOVu_1AjRAb1LtgIB3evICHtE6XTxUsE2nux0gNKYZg1vVCudUEaQsxJx5-E5myX95cxuknrvbS2aujjr5QF14ow3bsPsYOtt0n3zuIzS62eWJFvFTEqYYO23KFOxL4XYxNFp-v1XtRUYwdmUe_UAmxK_F_pEst4fCPKrVUkwX_Is1jbRDA3OJYH5-Zl7_neW4wONB3Gkh25rK_aTlKuNmFMvHkW8Do8wPHkcCDrnDx3K8d4J2dqVq1ebMMxM0kYsJVpnlPTOEN-K7jN5amQB7vyw",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/115737418330716551067\">Lucas Pereira</a>",
              "photo_order": 9,
              "created_at": "2025-12-27T14:28:14.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/a894ffa8-9e5b-4c37-b2e2-2133e12d7fa0/4.jpg",
              "id": "4e75fed7-2d42-44c0-9ce3-4fb38fc32f8d",
              "place_id": "a894ffa8-9e5b-4c37-b2e2-2133e12d7fa0",
              "google_photo_reference": "AZLasHohrWGtQS2kdv8WF3A-BKgOyr8cKov4SETt1NYTspcScBJj-FKEwEwMVzw6EbOJiVpiJeLOh_6E59T1FlFTIb0EqfpuBtH64c-Jf_8h8n203YclaRred_b2_nU9ju-WFHZxyGFzgWdgXotqSUpNyiuhPygeOi38VimkqCYSTukyOA73Lax_e9CQyHW2CkvFLPF1x1W1F3dlIw4jElw27hb043RipgBKppk1RXsjc8ZNg_aTbzFdQdsfRQ2ml3gKPW_Lw3zZRc0548fMTodsYuTg8M9mh_Co7nPx1219NWvNfcbzT-XGcBTkfIhjQqhdiL4pEBDMwtfYjEJzJjeLDKKZBckbUpLSi13-DjsVO19wpKSZFXWOPBiRsZSNZmxxc3a2ijFn-bG1fX_5wgQStvBt5yzeo0eZotu4gBknJx8RTmWK",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/112735921921798580978\">Dirlei Mendes Dos Reis</a>",
              "photo_order": 4,
              "created_at": "2025-12-27T14:28:14.000Z",
              "deleted_at": null
            }
          ]
        }
      },
      {
        "id": "146d4702-4440-4f09-a99a-5ba804674a27",
        "trip_id": "e6693b4f-9ef7-488a-835d-2cd8d9e015d9",
        "name": "Zoobotânico Municipal de São José do Rio Preto",
        "address": null,
        "rating": null,
        "price_level": null,
        "types": null,
        "description": null,
        "display_order": 0,
        "place_id": "3d60d327-492a-4a6f-8247-7c937d0ca694",
        "created_at": "2025-12-27T14:28:37.000Z",
        "deleted_at": null,
        "place": {
          "id": "3d60d327-492a-4a6f-8247-7c937d0ca694",
          "google_place_id": "ChIJifctTGGtvZQRCSxkcPCwL48",
          "name": "São José do Rio Preto",
          "address": "São José do Rio Preto, State of São Paulo, Brazil",
          "city_id": "d5d98abf-7f7f-4b4e-9bf1-399880b339e2",
          "latitude": null,
          "longitude": null,
          "rating": null,
          "user_ratings_total": null,
          "price_level": null,
          "types": [
            "locality",
            "political"
          ],
          "phone_number": null,
          "website": null,
          "opening_hours": null,
          "visible": true,
          "created_at": "2025-12-27T14:28:13.000Z",
          "updated_at": "2025-12-27T14:28:13.000Z",
          "deleted_at": null,
          "photos": [
            {
              "url": "http://localhost:3000/images/places/3d60d327-492a-4a6f-8247-7c937d0ca694/6.jpg",
              "id": "170203bc-e757-477e-b0e7-ec34f12d4615",
              "place_id": "3d60d327-492a-4a6f-8247-7c937d0ca694",
              "google_photo_reference": "AZLasHqaNceP-JszkL1LEHzy3LVS5yZ2SoAVQetCpxUTpwsTtbZt8u0DoAAuSe-fojzR6linleoqWq81zA0Z0DHerG6lzInCugala2KcA_aHdRVEqRY_p1DmOueEmF_Mr0srIkrbv1rhfMlorVVoy9GsoF_n0k7HWr21evER93AYVeDCTLwCZ1CZX822ieHY45f086ENACWwKT52LkzYCsFJcULI3S7kasdP5JdfhQ0-rcXONs9D2xiWDfF6_HqtPoAdqhm1xrBLmxwLZemnO7W0gC4qamenPB8TrmIvYMtY6YgMIKwb4FGNHhXlB6syUchGj5UqBrBROEZUJqhLag6RkqoI1tgEBfTUieVcnnHT9Ix4Qrt-XZz8U-_mEtBp52GU88jqaxGmB3ncpJx0qVR9Mfyl0KVTrooTTZZd7xWTqG5Cjg",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/104342994579464755536\">Ralph Schmidt</a>",
              "photo_order": 6,
              "created_at": "2025-12-27T14:28:14.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/3d60d327-492a-4a6f-8247-7c937d0ca694/9.jpg",
              "id": "7706a1ca-1cb8-4c10-b59a-aa32ed4e1fe5",
              "place_id": "3d60d327-492a-4a6f-8247-7c937d0ca694",
              "google_photo_reference": "AZLasHqiylWo6jH-R0L-3aWxB7EbIIhXY5UEh_o47ErrovMNgZHja_FYbdjgm28j2Ipyx0YeMSq24ES2RNiwopnv5kXyTPSxQPT3E6_8M8mOX1lpFL7MOU7J1cBFkNLUkdSt8LEmEsoONHtel_2dbMJY918ZRZvDd7q6sOl0pfHxsJ_sCUp9gjDPlUZW9z9tD2ZSyp_HV0jqznphUnGxP6PVM9TCQ0P-7blNOCwD7q9aSmO_XP0sCtkviomE3GhzHjPFZrq3K0DxLIqylHwHo9lLyYo3pSJL-dpE8BbUZbK9OYHx0BKUmTSDsTUeM-JmbzuxYUkwGX3lsBu6v_AKtXTi5ZZ7KGP2PDoRzfiQ4CEKPanMnrVLQCo_gV9Uao1a2UNKGu6VjaIOH4nstWVXXiKVbyj5KX9T9S4G-9dp30_BQhU",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/104342994579464755536\">Ralph Schmidt</a>",
              "photo_order": 9,
              "created_at": "2025-12-27T14:28:14.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/3d60d327-492a-4a6f-8247-7c937d0ca694/1.jpg",
              "id": "24f83097-f5fa-4c99-a133-7a385d6ebdf4",
              "place_id": "3d60d327-492a-4a6f-8247-7c937d0ca694",
              "google_photo_reference": "AZLasHqwwiVWWI6HsSJlwNwEERbSmJm-bskVXaetjAHxeX4HdwQgMADOPwZVs1crn2jl6EfBa09tdILxOgwFXiXGLLvElDsnvaajK1i-KVV-42KtQrLNBvHLvvq24qys20FuSwSJ4betbEs0l2zPAxW4G5G_vlW7Bh0qXI__afmPoh8UKAV4OR7ZPLWaCV4UxGpVY_Xu5MpHoSnV03NjcIDbVcjKEE3dut7PY7Zk3Ytx47jVp4G3hbDt6GvlPqiiIe8QSXzg4eTnx3DBDuUvMbu24LRKwr27ifWoQmd5wJHfZNxPSfr9Wbd-4OjN5cZju1NJi0llfExebtUApvQhPoZGH8j6HE71MS38IP1J92YTbGbaxoalC1mY5xMlkbPOIXveUlmib-ZdzB87Gi5S6KPlj27K8K2LtbVr-NfKeBRc7wzewnjJ",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/104342994579464755536\">Ralph Schmidt</a>",
              "photo_order": 1,
              "created_at": "2025-12-27T14:28:14.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/3d60d327-492a-4a6f-8247-7c937d0ca694/2.jpg",
              "id": "e3fb3fbb-6502-46ff-9208-248be52126c2",
              "place_id": "3d60d327-492a-4a6f-8247-7c937d0ca694",
              "google_photo_reference": "AZLasHr_06F0OGC5_dUVasRd-UF09oId6rqAl5PY_RKISdjdo5zBkqZFvkHc9mOzEJSAg18wFexgwZT0_Ckn8oc6joEbsOok6StiUjGN6cyE7r5JgLL9J6v4PVFbjiuanTyXiq3zGaa7SjnA5a1wZBevYOHxcdUgODRPalzhdvuBFeq-zgA_Of2zqfTZLe6KOZlvoX0tQi5dRL7mCifd6DGb4tHPhbOV3Owz4I_wiOg6smwbvY0XoP76Bz7Z0EEQYT-Ejs8ATV3jdSOinOjGZTB9sRu8tqnPet6s52SukYsXwzN-CNO7p8AVm_n5KxvTqItVYK29itP-kxQuOaMCb2OJGr32unF4JH0iegNhvWlItCNKcNke5191ATy3kh3Y76cbb8qXR6hK6FRpcXQOmCJZnLge9r11A4ONOaXfpTxnEvIwZA",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/104694050139203370271\">deusdédith ladislau josé Aguiar</a>",
              "photo_order": 2,
              "created_at": "2025-12-27T14:28:14.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/3d60d327-492a-4a6f-8247-7c937d0ca694/7.jpg",
              "id": "b2027fef-2a4e-4b34-8d36-a65650a43efc",
              "place_id": "3d60d327-492a-4a6f-8247-7c937d0ca694",
              "google_photo_reference": "AZLasHr0z-_l9SKLEToRMh1cmoH87Pxe7o0IrYx61XRlH4mwy-jxp2EsuoWUNEQCMb5RKMa_K9oJK-MQ7T1mLPVyTQwFZEZpP0Dd-OLKi4TQG306o8FohyOiHwFok6QsitaYTdKqOm3DLplV9dA6_b6IHj0ojlDQZqXVe4uw2hBKQ3k3G0J08y7G-XZkL6Bj-WWlYnSfpzFdrDUcilkf49n0fVIjyXjhxlz74tsTakfV_R4WJQjCNpgm8kvR52uLeibxwURDI92lNqK5YLr2ILrK7O25yM2MgsHr7DHd8vD72SMfoALF-DOF61jHvqLFU-jGCl8CP13K7uEhGdvld0wyooQlFtThqNV_XZKe0LG3hRnULiKS8eHVPKLptMDQQrJQ4FSNLcq4Qw7G6t4bj9s2dYHZ5oN96iKNylw-hX_KUEk3fw",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/100563036134611731789\">Fred Carneiro</a>",
              "photo_order": 7,
              "created_at": "2025-12-27T14:28:14.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/3d60d327-492a-4a6f-8247-7c937d0ca694/3.jpg",
              "id": "394e38a3-9b4e-4b88-9325-ea240e45fd01",
              "place_id": "3d60d327-492a-4a6f-8247-7c937d0ca694",
              "google_photo_reference": "AZLasHrkOU9CWlz_zDPgSn7BVuzz45iq99sK00XJ6aVj7VzPFUWhJsH1N5XtzgreBYzMkXnVG4oE93fZQALOVyZbjCuqKsWWGwZPQDwd1VxQinVEn9OajjuJc6NRJPOnrUHWJH-r9mhPECD1kfy8YaN7wxvdvMiYYj0eC-ottJqlzaCG2kSJKMubTlJzgzFnJ0ioJg38mGjPovEBzVkcb-hAKd-9NkBGNUcsLSl0peVhInwGL_tg0vGGwot3-IT0a99hJJT1dIlOMywe_Xe3IE1At6ZG-DmkguxpAj1DIWJj-D3wzc-5-qJxWIiqtdhhPn_NFbw7PkT4VE_5cF16xDxq0cspfimGWu9hvNNsuAiuJ7AhdDACQOwNQATS6hofFQ7yXxkB1l9CQRPe9WvkI05JZJHJsqk_s20HcXY6b14Yl3ZC1A",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/114756773755176421759\">Paulocezar</a>",
              "photo_order": 3,
              "created_at": "2025-12-27T14:28:14.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/3d60d327-492a-4a6f-8247-7c937d0ca694/4.jpg",
              "id": "035b68ae-54a1-4d3c-b1f6-ffeec347cf93",
              "place_id": "3d60d327-492a-4a6f-8247-7c937d0ca694",
              "google_photo_reference": "AZLasHo24ik7uqXvUowhDNLzy5JzI8nXg8j55mMVpIdDO8l9Qwq-9SKT6YWtqDymFYTdct3o4rSFGPGQYe-8uQRC6dbuk6obXHp1DOBOPg2_txAs5R-bcA3DmHeoFAnOyg2k1NkhQVrgw6RsCk-GmgBpIz-Wn7ZVWrt9zXBMO9QqX9y0Md9bZL9xFTAzlUrIzeMcEx1PFoioNMKjBDdykyRm_ZBezJElosFA406zYs3f9znnUdUc-gd5-5kYT2ZRKlg5QXbQLw04vGnm0_D_rualdKhk3j2_Gjj-OxNEx4OkcKlu9VDkjlw6qjGRaIsdSE5MvztRY3aARvOpiXzhzbP5rpedDOkLmIxlfj1spMsxycV-PLlaqSTofyKalm9PPOI-CVXtTK_BkvzmLuy3iHuyuo0nlc0RD_zzJ9fEJlVwi2iGug",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/104694050139203370271\">deusdédith ladislau josé Aguiar</a>",
              "photo_order": 4,
              "created_at": "2025-12-27T14:28:14.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/3d60d327-492a-4a6f-8247-7c937d0ca694/0.jpg",
              "id": "09b33bf9-353d-4db5-a424-d0a00168070c",
              "place_id": "3d60d327-492a-4a6f-8247-7c937d0ca694",
              "google_photo_reference": "AZLasHowkkLomUhk7fny_5k-d3G7yGm9X52LnqbCAsoaLYRpmUGoDp11bt-ejHFW1fPGf3YFgIVxbO5FUDB0iJiOJFqEH-2a_rteshPFTRavPlpnKW0eEjZoaQsRbCSXoG_n_VUVdc5HKqs5BY5G2q7rBX5uUo70T44tYgpb2p9d3I7zkEKqfFrLRBdzNZXI-d9ziu9tRL8NXykKX73r1ZzIpcjpNVDq5Ms-sKqcP2ACbuRtRtGJ3MV--FWiqU4T8nK0Llo3U84W5zHuTlR7JwxankQmRaEmGEiTOjEuZEBO3aAKHlFkzB_lnYrlwbUuYAFmw3ACFmVOBQ_4FSIB1wKYDdeTveih62QQd7qtzvlgj0hA6TUI8bPFMC_QZhApJc622hNYh05VLtsugIijLh8NfMJHVE_5UN0cTQH1ht2JO0wXGg",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/104342994579464755536\">Ralph Schmidt</a>",
              "photo_order": 0,
              "created_at": "2025-12-27T14:28:13.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/3d60d327-492a-4a6f-8247-7c937d0ca694/8.jpg",
              "id": "1947aa02-446e-4b18-9007-bd271c8b5134",
              "place_id": "3d60d327-492a-4a6f-8247-7c937d0ca694",
              "google_photo_reference": "AZLasHpAG2LjcWLUPjss0UvCxnwiFoN07I-2tZ0ZN_lWQG75g5znZhLilXui4Z3AcaMOMl6HkyQBsTyVnkX7Gsgg6c2ieFcHrCr9AbQgIwaGO1RCEBz1rZFcQCoXkJOEU5eANFruLq_8v119BDROqMmLtSI4L6VEWa6rV0Thd4dYwbgm34D32BwRtaEqx0GmVfMoWtaolR-2jrR8MkB_nspN0yYSzTNUeX5T4PLza5VCrOhIb4kBDQ1YcBr6eFK9Y1nFmmWCJvDvF2QyDoLuuHVL-28c7zB26Z8wS6X-1AF3rZLdXUMfskPNYw8dqMc8E0_nx83VaxouTvoB7zJyg_HdGiAagcSgjHO3zkL_tq7_M-fKFR3BgHjzfNABwPyS0za6dp78ec12mn5i-DqYIN5gFd3nJ--GH_JMjGUjNTavBUk",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/104342994579464755536\">Ralph Schmidt</a>",
              "photo_order": 8,
              "created_at": "2025-12-27T14:28:14.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/3d60d327-492a-4a6f-8247-7c937d0ca694/5.jpg",
              "id": "c4d97315-5484-4e2f-8eb6-6b6c82df0fc3",
              "place_id": "3d60d327-492a-4a6f-8247-7c937d0ca694",
              "google_photo_reference": "AZLasHqAElFr7O5DjYq4Bv43vgMaCbOQg0LDKnepiwebCQfiCKXWHB-tSrbPzskYNDVcp6wPbdTcnHybP9AidibqdR1SawxbOGD5ursNfYLLbonHRrvhJeyGLfx1Ono2CgRs8QwKEsafeE7OY3A0Ke2xK87WY5AN54dtK6gx2hu52tLrTIIKnJyal1L7LDAPS-OBcIPZgNXqc92MgF5qNa8sZdGy_5LOWkg1Ky2XwHpsZPGOGgYxXd6PPLSAF7nZemsPy9FxrNZsEzSWEJJjogbIFQh31PejsGLD44bpm3e3Qi3kNKMZPq6Tw9Nhq7MgcTPcIpv37K8XesB2PYLU8OPTcfkG3zlTjUnMIaSwjs-pKkNDI6NEXPr0Z8gT4q2MS29m7n7LpZf05RgGB3-k3x-YYa8nx-sX-ZIZ6ILMSIqznPx-AA",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/101207044495545716731\">Local Guides</a>",
              "photo_order": 5,
              "created_at": "2025-12-27T14:28:14.000Z",
              "deleted_at": null
            }
          ]
        }
      },
      {
        "id": "2d49f007-5ecd-4940-b1d8-d9b4483e6292",
        "trip_id": "e6693b4f-9ef7-488a-835d-2cd8d9e015d9",
        "name": "Educational Ecological Park 'Danilo Santos de Miranda'",
        "address": null,
        "rating": null,
        "price_level": null,
        "types": null,
        "description": null,
        "display_order": 0,
        "place_id": null,
        "created_at": "2025-12-27T14:28:41.000Z",
        "deleted_at": null,
        "place": null
      },
      {
        "id": "0785f3e1-eeb2-4218-95a1-80f19ddb2ce5",
        "trip_id": "e6693b4f-9ef7-488a-835d-2cd8d9e015d9",
        "name": "Cinépolis (Plaza Avenida Shopping)",
        "address": null,
        "rating": null,
        "price_level": null,
        "types": null,
        "description": null,
        "display_order": 0,
        "place_id": null,
        "created_at": "2025-12-27T14:28:45.000Z",
        "deleted_at": null,
        "place": null
      }
    ],
    "itineraryDays": [
      {
        "id": "716e0c43-11a1-4bfd-8dda-a7ed84014f6d",
        "trip_id": "e6693b4f-9ef7-488a-835d-2cd8d9e015d9",
        "city_id": null,
        "day_number": 1,
        "title": "Relaxation at the Municipal Lake",
        "description": null,
        "created_at": "2025-12-27T14:51:52.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "902d2db8-9dcd-41a3-b583-708760135edc",
            "itinerary_day_id": "716e0c43-11a1-4bfd-8dda-a7ed84014f6d",
            "time": "2.5h",
            "name": "Parque da Represa Municipal",
            "location": "Av. Sabino Cardoso Filho, 2520 - Jardim Estrela, São José do Rio Preto - SP, 15070, Brazil",
            "description": "Enjoy a leisurely walk or bike ride along the paved path surrounding the reservoir. Look out for the famous capybaras that inhabit the area. The park is open 24 hours, offering flexibility, but morning or late afternoon visits are recommended for comfortable temperatures. It's a highly-rated green space, ideal for families and dog owners. [2]",
            "activity_order": 0,
            "place_id": "a894ffa8-9e5b-4c37-b2e2-2133e12d7fa0",
            "created_at": "2025-12-27T14:51:52.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "6858036f-7e4b-42ab-b526-bff58c2e397d",
        "trip_id": "e6693b4f-9ef7-488a-835d-2cd8d9e015d9",
        "city_id": null,
        "day_number": 2,
        "title": "Discover Wildlife and Botanical Beauty",
        "description": null,
        "created_at": "2025-12-27T14:51:52.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "c06513e2-846a-4d14-9b02-1a63b7d1513a",
            "itinerary_day_id": "6858036f-7e4b-42ab-b526-bff58c2e397d",
            "time": "3h",
            "name": "Be Beauty Estética",
            "location": "R. Pernambuco, 2900 - Vila Bancario, São José do Rio Preto - SP, 15015-770, Brazil",
            "description": "Explore the zoo and botanical garden. It's an excellent family-friendly attraction, and a morning visit is often best to see the animals at their most active. The facility is wheelchair accessible. It is generally operational from 9:00 AM to 5:00 PM, Tuesday through Sunday. [1]",
            "activity_order": 0,
            "place_id": "98607488-442b-447f-a799-9c3de27cf013",
            "created_at": "2025-12-27T14:51:52.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "5702c405-a96e-45b0-9725-8f955cc41647",
        "trip_id": "e6693b4f-9ef7-488a-835d-2cd8d9e015d9",
        "city_id": null,
        "day_number": 3,
        "title": "Family Fun at the Children's City",
        "description": null,
        "created_at": "2025-12-27T14:51:52.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "b09fa8d7-9a13-4bff-80d8-68fb5fa0ab27",
            "itinerary_day_id": "5702c405-a96e-45b0-9725-8f955cc41647",
            "time": "3h",
            "name": "Park Children's City",
            "location": "R. Daniel Antônio de Freitas, S/n - Distrito Industrial, São José do Rio Preto - SP, 15035-540, Brazil",
            "description": "A popular destination, especially for those traveling with children, featuring various play areas, a snack bar, and picnic spots. Consider packing a picnic. The park operates from 9:00 AM to 5:00 PM, Tuesday through Sunday. [0]",
            "activity_order": 0,
            "place_id": "a4276846-e19e-44b2-bb4b-0de2d4bf35b3",
            "created_at": "2025-12-27T14:51:52.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "images": [
      {
        "id": "d05e2c70-7a51-461f-9286-f9f93223a2a6",
        "trip_id": "e6693b4f-9ef7-488a-835d-2cd8d9e015d9",
        "place_photo_id": null,
        "city_photo_id": "be098715-6f2b-439b-8b40-f0bc161d7079",
        "image_order": 1,
        "created_at": "2025-12-27T14:51:52.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "http://localhost:3000/images/cities/d5d98abf-7f7f-4b4e-9bf1-399880b339e2/1.jpg",
          "id": "be098715-6f2b-439b-8b40-f0bc161d7079",
          "city_id": "d5d98abf-7f7f-4b4e-9bf1-399880b339e2",
          "google_photo_reference": "AZLasHrtLc0RKEh_DEXbHJlhTnfszlL2LKioJQ3PrWB2uSJP7cP2l_zS4A8ONSMqGLZsoXI6pKjfKv8j3A3KnES04E32bsr57xB8Ar3kLn4SARPaWEkgBCT_JIQbAoYJZ12V63ZRFuoaBMt66UroTZqHQRI4riaViE-BPtzpYsHW59h6fq9NscFNcp4DFO4oJNHpAdHbHY4KkPeVcqO0kc2uCCUKt0AbGJPFxFtmstKm4zkFHZL8elPMawrs64gxBOezyCCgVYSrF1xlcNMOipVjeTw6n7cki69J4jko5G2AY-iErAXSBTCxTpxGXXMW9INpGnXIcaPhBnMETs9DcBh8sGG8FnQrmTsOsExKIoB0oTpwN6vgCTPtreK865Oa6CEMWYB4SeCpTaXX8tkbzBSy_Zg9f9u5IfV1Uc5RK8kk-VsrHW5v",
          "attribution": "<a href=\"https://maps.google.com/maps/contrib/104342994579464755536\">Ralph Schmidt</a>",
          "photo_order": 1,
          "created_at": "2025-12-26T22:43:43.000Z",
          "deleted_at": null
        }
      },
      {
        "id": "9d7ca105-1388-4d28-b675-3933f4729251",
        "trip_id": "e6693b4f-9ef7-488a-835d-2cd8d9e015d9",
        "place_photo_id": null,
        "city_photo_id": "e06729e3-dd54-4a22-b778-135c249b04d4",
        "image_order": 0,
        "created_at": "2025-12-27T14:51:52.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "http://localhost:3000/images/cities/d5d98abf-7f7f-4b4e-9bf1-399880b339e2/0.jpg",
          "id": "e06729e3-dd54-4a22-b778-135c249b04d4",
          "city_id": "d5d98abf-7f7f-4b4e-9bf1-399880b339e2",
          "google_photo_reference": "AZLasHqlqKqHESsvrooj6DF6qybFfVbGLoUZX0hvpLYaeLC6GXqn_7NVX5ZYHhJZzIHj-AtRAneDeq8jv1fLUZcgZ9aCqcI5m8tn-5BrgMPEgfs1XFEysUmT9_ST7zWpll5vZ8u-UNhLa7XHzV_iuT6C6lF-ZuUpdZvdEbNVzwpI99lt5xKwGlqNXmUtvodyDQE6eCspje0cBre9wt0WMFLSQWAisOscW6iNN0V_maQB_cAgGre5cimp_nY2ZnMaXcboCyr82tfS7YCtoqMFBHNfOVVHa7QluRccnxj0uRznhoSsxmK8mu9n0_3VieUtn7jpTF8lqjY2lA-8OaYBmHjkaPMaF5B0xeZB6gkAD86hT0zRw0kWM_kDt7Ha3oQK3fZuhY1YKKlEJYEBamtnT7xGpIf8EjOaVFbgoyHXtA78WsSqsw",
          "attribution": "<a href=\"https://maps.google.com/maps/contrib/104342994579464755536\">Ralph Schmidt</a>",
          "photo_order": 0,
          "created_at": "2025-12-26T22:43:43.000Z",
          "deleted_at": null
        }
      },
      {
        "id": "e8c1ec4e-9752-4e39-bbae-06171d4002fb",
        "trip_id": "e6693b4f-9ef7-488a-835d-2cd8d9e015d9",
        "place_photo_id": null,
        "city_photo_id": "6dbbdb72-5139-48e6-aa57-b4ac40e9d97c",
        "image_order": 2,
        "created_at": "2025-12-27T14:51:52.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "http://localhost:3000/images/cities/d5d98abf-7f7f-4b4e-9bf1-399880b339e2/4.jpg",
          "id": "6dbbdb72-5139-48e6-aa57-b4ac40e9d97c",
          "city_id": "d5d98abf-7f7f-4b4e-9bf1-399880b339e2",
          "google_photo_reference": "AZLasHrhU08UxzHR6coJBQNg-cw7VViVLupXRbbiAkkff0tpL76T1AEvpPAEfqSIvDNo8czx8Z2PrycLr0mQGZ_d9EqNIp3UB_S1SV9aaEYJbxk6lWCfEUVRzFavouK2feMHplgsNgCXFfu3Lt-9NoCfLcB3saeSFs1yiqzyfHxJfE1L-6L3TYQG3DUm3zyrBvPjaLhM6avLklsrYwu8kCSDtB0SeROqWOPLub5df95-7m8DVwdJO_OE3M0X45v0RyMh23Z0bZq3QW02kFUWP-5FxRMSaHFBKq8N3DOzlgjG1iuSisPA_3xFhHqky-UEQjwH71bYb-NpP0Cyp4FlTQksRg0wK6wPfxSm8_li-6xbcYXO11yfTlBNWqcr0iji_8hZCDVaqhyjc3vD90LZ0ZBYpcyEQf8NX7Rd_6Z7H3mR04pwOA",
          "attribution": "<a href=\"https://maps.google.com/maps/contrib/104694050139203370271\">deusdédith ladislau josé Aguiar</a>",
          "photo_order": 4,
          "created_at": "2025-12-26T22:43:43.000Z",
          "deleted_at": null
        }
      }
    ]
  },
  {
    "id": "817e87ed-adee-4a16-9c91-de5b6d6b218a",
    "title": "Disneys Around the World",
    "description": "Experience the magic of Disney around the world 🌍✨\nFrom the classic charm of Disneyland Park in Anaheim, where the story began, to the unique cultural details and breathtaking attractions of Tokyo Disney Resort, and the modern, immersive innovations of Shanghai Disneyland, each destination offers a one-of-a-kind adventure. This trip blends nostalgia, cutting-edge technology, and unforgettable moments, creating a journey filled with imagination, joy, and wonder across three incredible cities.",
    "duration": "3 days",
    "budget": null,
    "transportation": null,
    "accommodation": null,
    "best_time_to_visit": null,
    "difficulty_level": null,
    "trip_type": null,
    "author_id": "5ff3010d-aa86-46c9-9967-9777bdf0b600",
    "destination_lat": null,
    "destination_lng": null,
    "is_public": true,
    "is_featured": false,
    "views_count": 243,
    "is_draft": false,
    "created_at": "2025-12-26T22:45:56.000Z",
    "updated_at": "2025-12-27T14:52:22.000Z",
    "deleted_at": null,
    "author": {
      "id": "5ff3010d-aa86-46c9-9967-9777bdf0b600",
      "email": "raul19345@gmail.com",
      "full_name": "Raul Neto",
      "preferred_name": "Raul",
      "photo_url": "http://localhost:3000/uploads/5ff3010d-aa86-46c9-9967-9777bdf0b600/1766789123016_7dbd85d4-ec7f-4d48-a324-2161675308ff.jpeg",
      "bio": ""
    },
    "cities": [
      {
        "id": "b389d50a-dac1-432e-bccd-b816d27c01b8",
        "name": "Urayasu",
        "country_id": "531bfa91-38a9-44c1-be13-edeaed99aee3",
        "google_maps_id": "ChIJ1wEpTbt9GGAR091ls-NR7mM",
        "state": "Chiba",
        "latitude": 35.6531598,
        "longitude": 139.9019863,
        "timezone": "Asia/Tokyo",
        "population": null,
        "created_at": "2025-12-27T02:11:54.000Z",
        "updated_at": "2025-12-27T02:11:54.000Z",
        "deleted_at": null,
        "TripCity": {
          "city_order": 0
        },
        "country": {
          "id": "531bfa91-38a9-44c1-be13-edeaed99aee3",
          "name": "Japan",
          "code": "JP",
          "google_maps_id": null,
          "continent": null,
          "flag_emoji": null,
          "created_at": "2025-12-27T02:11:54.000Z",
          "updated_at": "2025-12-27T02:11:54.000Z",
          "deleted_at": null
        },
        "photos": [
          {
            "url": "http://localhost:3000/images/cities/b389d50a-dac1-432e-bccd-b816d27c01b8/0.jpg",
            "id": "8237df1d-2250-43fd-8f5c-a955ede1cade",
            "city_id": "b389d50a-dac1-432e-bccd-b816d27c01b8",
            "google_photo_reference": "AZLasHofwkRknE63e-KyMC3PNfCXm5RxVT8cGpX_w4J49TrDAjpyBtTTBnlfXabwdfsdIuysdQUrEPRvbpEOaSb-_l4RDh94gW68ei6jyGx9byPhUsFCj0_t8g-_7qS1vf-Iix4EAEPwE9EmhM8aN3FDG4HXf6U3-968HwelJWiMsVQSc_dr5CAsLcDn6_36H3PRfN8nrXRfDciY-Tn-ncx3PB7D14vE4J5WVCT9b7vLO0X9vb-d2S_b9BCsWvaCMKHquUP29Pk69-9w40ddLyvOrg3Vd29InUfjYsYNmByk_ulSnPG57b0pZ0CdnTTC2FgqG1Q77sAWM_Vs14FTe1x9Pkbp6jjO9rRHBXHOT8v0DS_48I3-Y1lgJOXeICJk2TCD0r_bxiZ0dwsU1bhPwDUSZIWJhXDYTb_haufUNHdyPWxBAQ",
            "attribution": "<a href=\"https://maps.google.com/maps/contrib/114319434619458797364\">シーズーシーズー</a>",
            "photo_order": 0,
            "created_at": "2025-12-27T02:11:55.000Z",
            "deleted_at": null
          },
          {
            "url": "http://localhost:3000/images/cities/b389d50a-dac1-432e-bccd-b816d27c01b8/3.jpg",
            "id": "3b8bf4e6-0138-4d5a-93c9-77ff1cbcd67a",
            "city_id": "b389d50a-dac1-432e-bccd-b816d27c01b8",
            "google_photo_reference": "AZLasHp7yIcA9Ryf9g2eo8jIcL1vpudz7xBzYiPwuiASAPrFrg3XNyZwVV8vMWi4V0cgMSvk7Ob8YptvaT_0OZyDizilMIz7ixGGW50ji4iMzT0WRBl1jFRPIATOCoATX7zKUzDK__JOlT71qB0AH2Up_a2CEMXdKbWi1dWOo37ArW19VNYpPiv7qyq5nRTKabLu8UBimvOflrjImqeAgjzkiRvpwQHXaKA2Lx9772ikCXklLkRN2ETtkin1QI7PqTZ5ZW3pRG_H3FYHlaO9ELcVeF-Ut2GHcjyIq_EIETJG9ZAbecrQ-byXsiyOewRXRckKI1GkCiuVAbfY7KQ91mx71IHx1GHKIV-_I9SVbSEjgfFUlgZTw3oSJM6jqoyRzm-99SuoZen5x5Lx6Cl7cBVx8UuIbEprxWuscz3Z9omK3HrOUg",
            "attribution": "<a href=\"https://maps.google.com/maps/contrib/110980684488387417089\">J.M.Senanayaka Bandara</a>",
            "photo_order": 3,
            "created_at": "2025-12-27T02:11:55.000Z",
            "deleted_at": null
          },
          {
            "url": "http://localhost:3000/images/cities/b389d50a-dac1-432e-bccd-b816d27c01b8/1.jpg",
            "id": "fa81b02e-85da-4f31-942c-cdf82e00c9db",
            "city_id": "b389d50a-dac1-432e-bccd-b816d27c01b8",
            "google_photo_reference": "AZLasHpxiMKGoOkP3Z43Xc30QCxl-F4bRwLWKAbOzTUi7xMnJDiEs4cYG8iaFl--Ht9cTsyt7MrOIM6BdECjx84SIj6l0OnMXIZiULeT_9VjiMlzNUO_W8xdoB0-lyLA8WplIyRW5jPy2nH6yXFekpUUgUFUCM88y8UeHvqYbQng9rBegljinb54gTLumY4K22AUibi7rNo9_2191Ln9EwxPlRE59fyYY110SgAta7d_JByspsk6_4tTqcU3JR75vNb_qYL3ecI008CPyXILpcb4emCaJpCOPy7VaqA-8jWGIwRndQMCbK_efyFr-Q3rgqjtlsnonI33PllH9eqOddjaQYjQ9vn_-QrOPXQh5dmLMEFF3uZKb9PZS6eVpqgbbsT5jFsg7QBznW_PFoF5T-0RmpGHVgNrLLrMqUPpC5TP3XU-rw",
            "attribution": "<a href=\"https://maps.google.com/maps/contrib/103863441429299258474\">yuuchi</a>",
            "photo_order": 1,
            "created_at": "2025-12-27T02:11:56.000Z",
            "deleted_at": null
          },
          {
            "url": "http://localhost:3000/images/cities/b389d50a-dac1-432e-bccd-b816d27c01b8/4.jpg",
            "id": "29d18650-d4a5-4911-9159-f259a34d6bc7",
            "city_id": "b389d50a-dac1-432e-bccd-b816d27c01b8",
            "google_photo_reference": "AZLasHrkPxRTKk7t01suBS_7u9ZiIiza1jXiq2mJYhL_uKoKfFRa5LqotbBKbhhIA8GBTlabJmGiGPFbwmsoPY9B8NdPZnTyIP5_B0-zm2DS3JFll_hJC4hJcJSPp5aRiWeAd6B7WsrQTRx8TyEPstFbIhyFTChOl2z6slNMZd32m2CFMX2v_AtThlMhH4PT4qb7RNADNehTBF5dsoEXKZ94v5zD99Y46CP793orG9bHrSgsSn940kg9fNVPTfN7N6kZj7S44ITsJm7CKpxrYrQF2all5LS9LZkuBG_sl7BxKfYpIXwa2PGKGJgjsL6EkmAGDeD561FYGluQFj2f6XZzAn3BUULL_QnVTZA-ciERzSefyAwMqLB-DwpFxErPtsdi_6DKXBZmt2tgBGHEVa_6bV8ajXXSx8N1gLkYnVHoLUwZg6M",
            "attribution": "<a href=\"https://maps.google.com/maps/contrib/111901072026110005216\">小林峰</a>",
            "photo_order": 4,
            "created_at": "2025-12-27T02:11:56.000Z",
            "deleted_at": null
          },
          {
            "url": "http://localhost:3000/images/cities/b389d50a-dac1-432e-bccd-b816d27c01b8/2.jpg",
            "id": "e7793d6b-1116-4982-9632-044d99b3eae5",
            "city_id": "b389d50a-dac1-432e-bccd-b816d27c01b8",
            "google_photo_reference": "AZLasHqkScmTW_9fvXe4FfAE5b1f26Nz3IW96TkeUTgXSXl61UoFCGDgLLN4dKNTB4Ys9yC9leeaNRHra1eSScBb8LL5DLYu-KuTpfbBcDo04r_kgCnWMFw6AaqMl-OuVlJEhnDqsWSYVpOHa-xvmi6N9QLl-_ZhCM_VxlAVg3H7O0xzTzYx1ppfHeYnbni_gMUzuH9l9ESuBRGQzzT-6lutN8PklPQR-9NgUn8usXv5qiJDOlPXJynTKmQ-vhAlp1kxsYIgYlT6FWUtROVLd2SJAxB_ldvySnIof6qPdR6Nv30X5qf7BxBI4KqDTkqjuN3SWeWzrEcfVuDpTOSXSo0mW8Ot4boD0p7DggH4wQSLeTiixSZO_9IxcJP8mtODAmOtFMWeMpu6uHdnqNA1-xBGhLumIJu49xbanmt8Krf-m3I",
            "attribution": "<a href=\"https://maps.google.com/maps/contrib/112598326381116068269\">櫻井志津江</a>",
            "photo_order": 2,
            "created_at": "2025-12-27T02:11:56.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "4852094c-b9d4-431a-a335-02a360bab3d7",
        "name": "Anaheim",
        "country_id": "74745e91-f219-4c13-87aa-2c3a6581d366",
        "google_maps_id": "ChIJZ-hVgPnW3IARYLErmquJqwE",
        "state": "California",
        "latitude": 33.8365932,
        "longitude": -117.9143012,
        "timezone": "America/Los_Angeles",
        "population": null,
        "created_at": "2025-12-27T01:46:56.000Z",
        "updated_at": "2025-12-27T01:46:56.000Z",
        "deleted_at": null,
        "TripCity": {
          "city_order": 1
        },
        "country": {
          "id": "74745e91-f219-4c13-87aa-2c3a6581d366",
          "name": "United States",
          "code": "US",
          "google_maps_id": null,
          "continent": null,
          "flag_emoji": null,
          "created_at": "2025-12-26T22:43:36.000Z",
          "updated_at": "2025-12-26T22:43:36.000Z",
          "deleted_at": null
        },
        "photos": [
          {
            "url": "http://localhost:3000/images/cities/4852094c-b9d4-431a-a335-02a360bab3d7/2.jpg",
            "id": "d84c1971-474a-4364-8c5c-eb5519b1dc0d",
            "city_id": "4852094c-b9d4-431a-a335-02a360bab3d7",
            "google_photo_reference": "AZLasHr29cjdvP67Lf__V7gJ-dR3PhbQrxBXQH3tPA-ypKSyiXjEXA9Kdxaoa7WJRChiJABeIDko1V5yguOAnUmsDdf1GUFtYqVMDvcwN2bBeEzXqWCTRA-Rm0TCCuon8xPr4_d9iUgAMDBBwIiEzRQfJaKn8yeuiUqdkpBfn8ZN5ULMuz6TF8X_RVhVQPyegkN47IYSkRtXDPnT_NKmnl47EB-kRrAT6qhIGpEm2VXvhxkqtzqo0jQ4oLYCtkNa6fhXfGIVHuSoF4q_EIbBWcUD6zJx9DB6ptL2hN2N8H6Gsl9TLn-sRxNthFxPPG3qdfKWUOMmmcHIfLe4JWaEPFS7fPZy3hgzJTFWvAjAEZ0RS2Mc6WzpRWKEbR4WU5FVhraLVF5vRaO4glk_FsF3eUUar4mRrL5dKkPPa3aqa0kUviZ87g",
            "attribution": "<a href=\"https://maps.google.com/maps/contrib/100393522024736353002\">Татьяна Сушальская</a>",
            "photo_order": 2,
            "created_at": "2025-12-27T01:46:57.000Z",
            "deleted_at": null
          },
          {
            "url": "http://localhost:3000/images/cities/4852094c-b9d4-431a-a335-02a360bab3d7/0.jpg",
            "id": "9175cb69-fbf4-4964-8e9b-31e5f3b738df",
            "city_id": "4852094c-b9d4-431a-a335-02a360bab3d7",
            "google_photo_reference": "AZLasHq6XrPhJplVf5iIrvdLYWCxwP3_aC0JEOxpHqE0KwiR2O9U2WZ-MMebQKOx1b94TWkwCM36_En9WlFWWdvGqYkgMIP9IxmC9Iz3MubC2leEQ5IdUF7V0kqF6UJdAnBd7d3VDfuoz4-MKFYmTpNWiFlVJNw1-vXD91aOkNhIOhqWkscVPl82e6HPfbT06vgdQNJ1kKO6gjL8-KDdtsPx2hZ3DXaYt4T7S2B-kFClTWrHy3twGJxIDmG5S-UPsP4Dw-cjEY8cWJZKnUlAuN7hfryvoPAcNQIrwAVWxF35jLzTIsmtKs5pMv4gm4LQQdcX1ssmHCAXAqSCSiIH3n3_miTJFZl8MtHg4kSnkV3Ggu8QKOGauhjBL4hUYsrHqi2gheSYQu78MUhxZ2-hgJ7DgDIkpz54SErSkZ9Keh9bn1M",
            "attribution": "<a href=\"https://maps.google.com/maps/contrib/104595769235117236345\">Martin Vorel</a>",
            "photo_order": 0,
            "created_at": "2025-12-27T01:46:57.000Z",
            "deleted_at": null
          },
          {
            "url": "http://localhost:3000/images/cities/4852094c-b9d4-431a-a335-02a360bab3d7/1.jpg",
            "id": "0fae89de-1d77-4ebc-b787-933c4de6384e",
            "city_id": "4852094c-b9d4-431a-a335-02a360bab3d7",
            "google_photo_reference": "AZLasHoVBzL6LgShO0tFhsnkSUOslrEC1lfWtKYYjan4OyMi-tCKeTBLldPC1cIG_q0vnrfKSHm-PpdiGTWy-qNZ6zZARPm_sYbc9dE85j1iKCoyaWDQ2_nIw_ecf5FFZ-pFK4xoZR0Fp5Kq1IJlAPvtyvYcA_RD4_RpXmXW3n5CJfk3lQmH7KCvHlh5Laeplr9TCrQfr1GN-tLZTpqK_vqwgaE045aenKlZGdbPmTXD92NUg4C8Kim5OJUyDDL09qqPodCYniZRY6t2Co9TiO3tfFqOPai5gkkp3a3ooWjLISgSLDR336tGfDKcjjp2uIuyTjFBe6Xp4Dx8hFfu_y0m9gDOE9DFQsl7n-Cc_SwkmkTWF-Xt_HVf7LQg1RlJ0-1PxTnSeM8UQtLC6SclI1i2kw3M-Apywy2W81CXfxroXiLTAg",
            "attribution": "<a href=\"https://maps.google.com/maps/contrib/100393522024736353002\">Татьяна Сушальская</a>",
            "photo_order": 1,
            "created_at": "2025-12-27T01:46:57.000Z",
            "deleted_at": null
          },
          {
            "url": "http://localhost:3000/images/cities/4852094c-b9d4-431a-a335-02a360bab3d7/3.jpg",
            "id": "abd867bd-a72d-4906-a6e2-f9eed4a50d99",
            "city_id": "4852094c-b9d4-431a-a335-02a360bab3d7",
            "google_photo_reference": "AZLasHrZmTc8bdZ9qfVNeqnJ7CXjJxK8nyOPy6VusUQjvXVczQtzQauG-kTXKhBWIUc0hXbFSW6n07WmfyDCjPzWOPgQaymvsr2B2F7Bu5keQk4FOJRsh5_zq8XvieBs_wmDETTxU039G9ePR0J1_t91XsIZVSyyVbxkpUqibSkRq1JQdI4VyNGFa0NsfHSATtUSwc_aH-O51us7-UswVcCMFzPBokXE5e3Sqc5gMthfkKJiFSgnx9w89mIJBdYdo_5N3K7QXj2EpcJp1mg8xbNPrjKgGfXQZRVf7qm8BFha5GfJL8HVnvZdiOEWwaJLegsa0LG8aXx6uC_-vUBQyxW_zsjhuithdhYRaNv_B0FDQTW5-P0gsaFu8UszMZiis2C_l9P4PmB93aGLWTm9w6i3oA-D7PaHHFvtdWJgpOrXrBI",
            "attribution": "<a href=\"https://maps.google.com/maps/contrib/114276334117880862142\">Chris Lucas</a>",
            "photo_order": 3,
            "created_at": "2025-12-27T01:46:57.000Z",
            "deleted_at": null
          },
          {
            "url": "http://localhost:3000/images/cities/4852094c-b9d4-431a-a335-02a360bab3d7/4.jpg",
            "id": "cf66845a-1795-4172-bedc-30bf1126fae0",
            "city_id": "4852094c-b9d4-431a-a335-02a360bab3d7",
            "google_photo_reference": "AZLasHoL2gkyPSZFuM9eWHlvstjBXNmh9Ob7une0PNWxtR0EIl8BNi3_jgAE6mxnktipV6HqsNV94-JAFKG0B_ZTE7xDz9w-BqyvVDOxthRELyIeEib0hPosuFP9yI2mRe3--qoVeYc-Zb1EZ5a4hNBSuokRCaC-rbZpmqdcYQI1PalkFEHLfz77oex4JfWMcIyYV8l7kFcbskeNQ1CdEHHm6bqQ3w234rOlVGhaa-kdEqUEmNERv1CDHkR0UdA66uReGp-pCcq4k0DJZpN1PuPKOVFemjq6iD4NLe7OUCK4Xx3BlCXOiGY9lMnw5uqN3xM16IJ07ksKTYHOomrkLnvFNP0CsGQ9f2lZ5sPleh916iJdOdeq22aG7e9C__IqQgqb9lq1yLo0MvsIX7eBMGwn9itF4p3CvTt0GBajsgf4WZI",
            "attribution": "<a href=\"https://maps.google.com/maps/contrib/112368911569888274866\">Nelson Roman</a>",
            "photo_order": 4,
            "created_at": "2025-12-27T01:46:58.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "0509439f-ad0f-47ca-93f3-5a1cec2e88f7",
        "name": "Shanghai",
        "country_id": "d6599deb-24b2-4ad0-b2bf-6cf01af63151",
        "google_maps_id": "ChIJMzz1sUBwsjURoWTDI5QSlQI",
        "state": "Shanghai",
        "latitude": 31.230416,
        "longitude": 121.473701,
        "timezone": "Asia/Shanghai",
        "population": null,
        "created_at": "2025-12-27T01:54:10.000Z",
        "updated_at": "2025-12-27T01:54:10.000Z",
        "deleted_at": null,
        "TripCity": {
          "city_order": 2
        },
        "country": {
          "id": "d6599deb-24b2-4ad0-b2bf-6cf01af63151",
          "name": "China",
          "code": "CN",
          "google_maps_id": null,
          "continent": null,
          "flag_emoji": null,
          "created_at": "2025-12-27T01:54:10.000Z",
          "updated_at": "2025-12-27T01:54:10.000Z",
          "deleted_at": null
        },
        "photos": [
          {
            "url": "http://localhost:3000/images/cities/0509439f-ad0f-47ca-93f3-5a1cec2e88f7/1.jpg",
            "id": "3cd3a112-e001-4920-acb1-c86df4e467f1",
            "city_id": "0509439f-ad0f-47ca-93f3-5a1cec2e88f7",
            "google_photo_reference": "AZLasHpgnOjKNmObbvkgCpd9d4-pe-jOxSgu6xzNuGKwBaIpPMBI6w5Mm-LFT_ddc6r3TMJZSPekMJQAyPwHagIT8KDDotjFEguuhaHZ6yCe6UFqzttX5YTqEt1NhfMsyKMfytNlT4rBdX68kzUXzdn9i6ykGQcvUQTpVP3PT5Sg7jJSfeV6SD68gFf4EKCEr7mLCBYrcJPtHviLB4hsMKD27nQ4aeTU2ry2XMujpK6XYdEtMCDIFbnQs4MHADgsnn6J1hrZ5yq8VsWi7nv4NuSKS250PBOvhaNR6shIp2uy7WUldFpw4C09A2NQ5HQnUt8ovsG-a4B8nBEz4o7S7LxXPINUcKlxJDP-OlUdiQZ7Ywgpy0bkMADykwPc5TkCDPkqfM5RRVGlCdpXo_t2QkyS4wu0osei3EJsCIAoz1c8khgqeJp2",
            "attribution": "<a href=\"https://maps.google.com/maps/contrib/112597400415056135263\">Digital Enforced</a>",
            "photo_order": 1,
            "created_at": "2025-12-27T01:54:12.000Z",
            "deleted_at": null
          },
          {
            "url": "http://localhost:3000/images/cities/0509439f-ad0f-47ca-93f3-5a1cec2e88f7/4.jpg",
            "id": "9a49392c-9960-436c-a299-22c81f2fd439",
            "city_id": "0509439f-ad0f-47ca-93f3-5a1cec2e88f7",
            "google_photo_reference": "AZLasHqtd17KgjrW8gQY9IYzf6Wm2e9-PuFScolcTKdJGqawLhEQT1USGAHSAmvB5jmEaWDSGM7B7jOV7Snhqer59yrbhEMxzPg04bCW-bf9qqv7E08uLk_mHUTnMrz-uWbYluiAxEx4T2dxNq4PJMx4ImWar57O7-SDNS_f1YIsuIRVrGgQNgHo95tzE661Nlu6VHBRvO1EMIfpyBnn0kYD9FUk1YgK4QqS2EW0EAbsK82DCBPT3SuaJ6-01I1tV-4khld6WrCmAvuixhpLenga1GrhPfKfFUGQN86La2lOQ08BFgrcQ-A_5qsPg-UYkuOnY-KEGA4W8O38ugeFOKgBJfSAmC-nUZQsy870m2XAEkeB0xkN8XGgLIer4frGuui5pA8G5cW20GIiL5NP8Zj0EQeyYZb5VKYPZYjZyTr_K3eKkA0",
            "attribution": "<a href=\"https://maps.google.com/maps/contrib/116528787075652830305\">Baxter Yazbek</a>",
            "photo_order": 4,
            "created_at": "2025-12-27T01:54:12.000Z",
            "deleted_at": null
          },
          {
            "url": "http://localhost:3000/images/cities/0509439f-ad0f-47ca-93f3-5a1cec2e88f7/2.jpg",
            "id": "7c46f643-ea57-4ceb-93db-33bae980eadb",
            "city_id": "0509439f-ad0f-47ca-93f3-5a1cec2e88f7",
            "google_photo_reference": "AZLasHqkw3xVK3qql2jHugWXyIesbiolkdvH0DqIA80qsK3tFbUCsXSROOpuqOFmjgTTU7RgYi267x0SoQnbyHH8Y93lFkpIRDuTsERAIl_xnIqZw-lDF7uiwXZZ2Wwwa_WcPRVqnvyrG5lSb6X5NdQ9y1jCuq3o8nf7kTT9sgbLH2e5O0JkY9K1YBEhcGac6YtgBWxObL9yjYI-R7M-mLVDR7Q4svOzJhAwcJAybchCTHGc_s2XVpq8sLQIYi_tK_q8_z6E6TTY2v-02FNBpQQaHyHHQtI-q_SXrDFTpLxoC6j-eM8pM3pWPM-6hR88bD5VBbJtZdHVD_OixkLRUQwNf1bRVwOC_jdLpaqV7ZJUvtPJIYsOTPgnPb3aWbmLV0qALZUoRgU_jLaSIaoGqCXR6Uh-hPRhDUKcBiYCnI-zvxCghg",
            "attribution": "<a href=\"https://maps.google.com/maps/contrib/106884672341484622858\">卢森Lucio</a>",
            "photo_order": 2,
            "created_at": "2025-12-27T01:54:12.000Z",
            "deleted_at": null
          },
          {
            "url": "http://localhost:3000/images/cities/0509439f-ad0f-47ca-93f3-5a1cec2e88f7/0.jpg",
            "id": "e4b3490a-a23a-42f0-bb16-8d6dc9172642",
            "city_id": "0509439f-ad0f-47ca-93f3-5a1cec2e88f7",
            "google_photo_reference": "AZLasHqHSJWfdamzqo7_TPV4TFH-msxPi3DIuELLeC975txRUVURD7_LgBm-2GjKMqITe9RBuHOHDW1iApLaVjd0cZ91RQNpmJ6TZO_pOhYW3iCDoke3I0wIrUB78CpXu1E-wvluGzcQaUJRlTVDFAWK6OdLHhJZNzQoGcu_Qw-J60FAQfPqcNzI3GfC-1t-DJguW6n642ndOnQzW0Z0b2tt9BB81Ljgv-BfhdykM5RjxzxWaRkvhPvUoLZ5hoGZMd3_x6NBysfxVrXutg0LAtdjw49CwvPtx8_7rR0x8LXG09HibE9FRu9xZH85bZRw9QEtf928251iBLmKgMNsQy3FE3ZoLBzypZenzbyNwipwVSDHDioVvbRQoEdq3osopD1CYQHXNzxQLARFZlmNEDz9L-AvnpejcIO2vBeyfvAHb5IvSA",
            "attribution": "<a href=\"https://maps.google.com/maps/contrib/100249764873276084381\">Walter Galvani</a>",
            "photo_order": 0,
            "created_at": "2025-12-27T01:54:12.000Z",
            "deleted_at": null
          },
          {
            "url": "http://localhost:3000/images/cities/0509439f-ad0f-47ca-93f3-5a1cec2e88f7/3.jpg",
            "id": "f802c723-ad99-4537-a251-7d5f6039b134",
            "city_id": "0509439f-ad0f-47ca-93f3-5a1cec2e88f7",
            "google_photo_reference": "AZLasHrr7yDBEKPhBU5NzFXXoeEGZYJHbI8t80B8HBW1vJ1ZH7TkS1zp5xAYh99a9RS1JBZ0WOXZdg7MVNEai1DZJdalUUfRAX3cDdCoU2vqF1MVcERcai6XsU4mtwcty-ejqya7SPuTB4RO8B4ytaX-PVMgfpx7xdQ98-FKqQ9499Q9-C0WYUgU-kWqWOznjs_P-NF7jGcq2hxNm4a_RM8FU0qqxuJuTEfzrmFmVx-v2riNysiARNQZR3vkD50g-12IEQXWT4lUpkRy7zwhd2lbC6rKCqRCv4b9sEn5ehqD1mMCskbz2Da18LlpxPvqbXqiLSn9EumDPZuutW6rOkg2N29WxV3HchfK_hkWdZt5deMeURJ5MRw_Y1aeuFH5Y9M1UtziCysXXyAdxVwqLABI7cb0vSQYFyR8Flu8ewTRNDGy2XBa",
            "attribution": "<a href=\"https://maps.google.com/maps/contrib/107916202987401409096\">Loch Rob</a>",
            "photo_order": 3,
            "created_at": "2025-12-27T01:54:12.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "tags": [
      {
        "id": "95f5e7ef-2c12-4c97-8a6e-3bd886dfac03",
        "trip_id": "817e87ed-adee-4a16-9c91-de5b6d6b218a",
        "tag": "disney",
        "created_at": "2025-12-27T14:09:31.000Z",
        "deleted_at": null
      }
    ],
    "places": [
      {
        "id": "96530649-ab7f-4b64-a5a1-902ec46d551f",
        "trip_id": "817e87ed-adee-4a16-9c91-de5b6d6b218a",
        "name": "Tokyo Disneyland",
        "address": null,
        "rating": null,
        "price_level": null,
        "types": null,
        "description": null,
        "display_order": 0,
        "place_id": "a2192b69-cb69-48f4-9883-676df63bb417",
        "created_at": "2025-12-27T02:11:54.000Z",
        "deleted_at": null,
        "place": {
          "id": "a2192b69-cb69-48f4-9883-676df63bb417",
          "google_place_id": "ChIJszdHEQN9GGARy9MJ1TY22eQ",
          "name": "Tokyo Disneyland",
          "address": "1-1 Maihama, Urayasu, Chiba 279-0031, Japan",
          "city_id": null,
          "latitude": null,
          "longitude": null,
          "rating": "4.6",
          "user_ratings_total": null,
          "price_level": null,
          "types": [
            "amusement_park",
            "establishment",
            "point_of_interest",
            "tourist_attraction"
          ],
          "phone_number": null,
          "website": null,
          "opening_hours": null,
          "visible": true,
          "created_at": "2025-12-27T01:46:48.000Z",
          "updated_at": "2025-12-27T01:46:48.000Z",
          "deleted_at": null,
          "photos": [
            {
              "url": "http://localhost:3000/images/places/a2192b69-cb69-48f4-9883-676df63bb417/3.jpg",
              "id": "c67495f6-5442-41c8-a47c-45c99f7c2aef",
              "place_id": "a2192b69-cb69-48f4-9883-676df63bb417",
              "google_photo_reference": "AZLasHo8wadbMUq13zi5YPefFBRnmufsXub_8xKPZ8CVQ0yK5pyKtkAGoporJrAU6HHd6j8Gh6dWE0xSKkTPqDkYgm-4NOVhBhlZqTFvBSF3YsOIBkekZuWW7ZyFUv8vCsfY-5RIRDUNhxNBNRUJDi6XV8GoFFJQTEkNNEXAJKuxFohB_DblJIruLeASw9mFsrAx7t-UShGI7cvBWHYJpZX817y91Xe4GsAIyLmD47PPw5awk8PMrKJtw3lINXp5KYor-O_Bp4rG3PL9JWUPV-1J9xbp59G-ANxSy578qidD6ELKT52KIeMwQMm3jW34GTafhzdLYcCiBUF_WEdDewP3zSpI06J-9mrv5g097GMjVhso8m2wPltVj3yXAyT4Im7z7uobQ1CK7R7qpfHRfd1hO8edbmgvj6BZ-cmJekAbJDnADQ",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/101775877065786075871\">aya</a>",
              "photo_order": 3,
              "created_at": "2025-12-27T01:46:49.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/a2192b69-cb69-48f4-9883-676df63bb417/0.jpg",
              "id": "50cbf20e-4915-4853-9e6d-b34604822ea1",
              "place_id": "a2192b69-cb69-48f4-9883-676df63bb417",
              "google_photo_reference": "AZLasHoeYsnkmNkjQEGAIQX4nQ3l-0abgchGJDG0NqBWk6FJfYMFZq6EN3_MRFf-4PYurTmj81UT0pZrvS-p7SWuKnBnSNtBULE0RB5poE4uh1VyqBpDQ7fXg504GF9gpRCVXb0hVjMjwH6u2AFoxw6nNQK_oyMkbXXZI3A5-GBAKev_qTDe-66h-lBEv7SCuwDhUZDFx-nRcfgHu0HxbXaNSWgOdqAmSxY9CpjxnlIOUuUNHgUjJ37DM5ohDPQZwwfQfUsdD2Nirh6hub_WsMQnTKXt-4e4DOBKhP3-h8-iKwM7ewTPJZJX2Q8sUXcZAKyjTdd6ADsCQYZVbZgJ9rCIjuzXZyzvKCUK5chvXMOTpAFCwG69dKzD1qbQapIC8qSN-1NahlbwyJOAX7ahq6lMra9w0fsWy4K5ifikb4xWpLI3EA",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/115755190212866713210\">Felix S</a>",
              "photo_order": 0,
              "created_at": "2025-12-27T01:46:49.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/a2192b69-cb69-48f4-9883-676df63bb417/4.jpg",
              "id": "6528dbd0-4b29-483c-9f7e-65b3175523f3",
              "place_id": "a2192b69-cb69-48f4-9883-676df63bb417",
              "google_photo_reference": "AZLasHoTBoGufWftGlcKBIs90x-d-3Zde5UEOCktxXT2DuqAK5K-EmHgYDb9wW4paf47psoulpXSxMuAv2Vkz2jYmY97N1tdAA1cNidn7nqMq7pwmENyHXelyFGmvtkjfQP9rhFALrqebAh2V7STSZ0wUesD61W3I-R5q-m-dA_maxOA8eFmyWXv4OoThZkAlQ8ULhQuA76z5gM2amX6CjQhSOSVc-u4Zq7Nb9zFe75IVI9pV_9bQTLbPLFQn5eXrqu9qSAXvyrk74EkZT0BQjFiCR41N6UsMF3PtJsOyw0U99brlWoSKOXoXOtMVmz6MyOUlc8sz6w0YSXips7zjmgP35lGQAhDp-mCpA38BlLjANlj2JwUIyUkFFNh0F8UW8nPLzjEV7Yh7P851wCCXfh9DsBgWsmgNNSiDhMPeQUFgKfO1sYq",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/116784712320591205578\">mina</a>",
              "photo_order": 4,
              "created_at": "2025-12-27T01:46:49.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/a2192b69-cb69-48f4-9883-676df63bb417/8.jpg",
              "id": "22d5fba5-4ee8-4e48-96bc-9605b2e89a44",
              "place_id": "a2192b69-cb69-48f4-9883-676df63bb417",
              "google_photo_reference": "AZLasHp3xyD7b7LBeUoT0CrWbqh9GI-e0l9qUJYUPjBYVv1MEuh5rwR7BzzaAHBY3pD5vUw-XFdqSVqqEH-alcsoZQnxiYIMa0m5bradVf8BG-Gyo3-eSSLI5H4vs88247vNYwbcOSbtDlzTKIp7xW9oUn-MPPnoSpzkbP3_trb3FI8OuBgLRVGmy4TTbdwBZe2FcSw9KkxQYU6buBPGxOQx-VvBE4lYzyXGPt3MiM5SnN8NercafpgtKlM7pYvNdi6mJY5TQUtNve7lRf71kfxiyE9fzjZnB2NqVx9CMXwnaUuMStyd8tci6TAHV83GqXUp_PSz11vi1BiaPzlC1tMrfJHHRpqTQfSNRdO-vDXUn6351YbBBh9TEOnkr__8X7vlUvxbqXjug95wl7Qg6-ruCRBEqpEvuQFxVpMkiQajUSZAzqJKdpuOr3eck3XNgsKr",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/105682422124180061694\">Ryohei Nakatani</a>",
              "photo_order": 8,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/a2192b69-cb69-48f4-9883-676df63bb417/6.jpg",
              "id": "07dfec70-037c-4678-b271-8899f71a3c77",
              "place_id": "a2192b69-cb69-48f4-9883-676df63bb417",
              "google_photo_reference": "AZLasHo5t7yp31G0OzzCMSUDbFXclQNqMcPkXZV6lXu9yusVlA2_141txDOyF6_NaLwDPv3hMtbQFnkpoTWebkQs7o9XgTykQF5ZVJvV8BdywacddOkhExHsnGOybKPDiYJ8BnTMcxaMiCb9iwm637D7MC1BDA7T9BZPVlg9fEriC4DrX8xUvztg7TXXBYkahH1ZuOI5HET_Rijj87J0dplKWrBdSrGt7adpXLEm4tOzAaU6gm4LfimowbARB7n5-FkYVYPrc490OmZdyv6r7d-8kz7Q_2JRemOS3mrHJOL13yZ4fH7uxb0dgBrgUQVGHSOY9ib5Y8EHqOEI84njIS_iB4zd_fIfXJPlaQmitRLyKBSxZeXcftON5am2UhlA9gbJlkamglNi1VcpWIkKB981O64SvpEzJ-2lq1GLfnUdUCl8XvAy",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/100244162583833720398\">やこ</a>",
              "photo_order": 6,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/a2192b69-cb69-48f4-9883-676df63bb417/7.jpg",
              "id": "feb86241-9256-4555-b5f5-36c132396de6",
              "place_id": "a2192b69-cb69-48f4-9883-676df63bb417",
              "google_photo_reference": "AZLasHptEQb0pFWjiSLRR7bxXKmPrHgUUnJ-hHwVLFl89ekWEELya9Dl6L6YIPCnja6b332lmIpw0SqZtZfsu3BPlP9bXVScXmqKQ85_6PPX-8xJQxUnBauyNyvPPXkLOVtBzueFhJSxzYsaF-Njcbv-VnfsWHqXnpYfEKKotI-0fWRgcifjrfXe7ss0x2I0_dpNKO3PUs7lYivi8YFzQtUysQGlNOcHZIQ77LLohKy09I6e6xjFkrTCVF3VdBVRChcTrJqjuMy1orp31iQGYe2e0mGZ4qUDEFP1S89dCSJ0yeCKnA_AofBwq5X5bHx1foa3xWE_csxatjB7SePJkshY-i3JLBgLfIPQAd4LPuRDPj1laLEX3wi8M8lbRHkKEmHkb0eRuIR99uTGxp5LOyWu_al1zPOnhmIFhkl2fbDQhC-0xA",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/111753278927358651997\">まゆみ</a>",
              "photo_order": 7,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/a2192b69-cb69-48f4-9883-676df63bb417/5.jpg",
              "id": "71e2e95a-f1de-4860-9734-52523d7a88e4",
              "place_id": "a2192b69-cb69-48f4-9883-676df63bb417",
              "google_photo_reference": "AZLasHrMLlktUdZ2pl-9jJystP7n3sLc0UKesKFS8-fQYj1lJAse9KISiXs9gmNw4K-wfuymAnKQ28fYueobzd2WKUhni4dKf7CwB_kdP0ExRYZuLvPrqUdF0Tnt3CB5LcJhtTy9egGXwOnjczGJPXRF1E--h-txw5mK_o-qzcHPqNzFJbz3C7GPsUVaGarpjrzGC0rGOI1IYaW9UX31K9LJtYao3x8tQ2C9ksnUvMtXE8kl9oR92TRYDyIw1rb3uObYVyiRPH3X-_O0iG0nZwJpyfHdeUlVhGYkNLJewPCmlBEjBM6FzZrKkAd3v9nWSfmdLhzGpn1B2ESGIyO_r8LhiPNwvVFEinIIiLHdK_cZCdNGVtnx8CcYG9mkkR32OO_agr1RCh5dbA4iaM0Y2VpFDrbiKpZ4YO-MDhs7bbzrXac",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/112351442533186033554\">Hiroshi Okawa</a>",
              "photo_order": 5,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/a2192b69-cb69-48f4-9883-676df63bb417/9.jpg",
              "id": "61e19943-18a5-4760-b76e-735953509413",
              "place_id": "a2192b69-cb69-48f4-9883-676df63bb417",
              "google_photo_reference": "AZLasHrn18heh4CMTWVKT_InAWKi7_NqGKLpmfxGLhbzBQypoPA8hQWAk1lKJS_GaP3xiiTqiSVKiIa1e4NmPVcJcV_RG3zQ2Y8GeSIuKettmkK0u83fuUxbgyuWCdJL647kUjRz3HS2c9fGo5S46bjlkzG6XXCNeMRe4AoReRVo6zBSSrOuCEl1g2dsbLqys03znriYkCKi-cOFe9wDAoi2O0wwk7K1m-GlZwTDKoSdImb34bbc56OH4Gy9dCBeBoWUPgRtWJI4XvkXgzjA5_C3F9to9655-lSfyxYI7QoEE90IrsFM6fJedP-nrgr6peyod_jahQdh-BEpY4x77NNXmHPkhtEHwZzrvaTEvqGltPY6QMJYNoYO0XnJ6nRoRq6T-QbT5apRT1LsvlFbKUX5Q_muKpehsPYdTxLgQWAPBAa7Xg",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/107664737304776406576\">Taaha2011</a>",
              "photo_order": 9,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/a2192b69-cb69-48f4-9883-676df63bb417/2.jpg",
              "id": "b4fa554c-87b4-4fe0-88b3-4d8db3b91a8b",
              "place_id": "a2192b69-cb69-48f4-9883-676df63bb417",
              "google_photo_reference": "AZLasHpfh7uCWOzXBGzRofOx53Os-kR-pojsbV3ov_GnyJRIml4KzzMiPauWh0HoRt5KX7TN25Om5eNWURUQCsQxyCBmcedmaHfVR83Md1q3zLyXwBWnmT_Ys0PZ43uwYU3FW4jzFoKNmHzxNYfDO3u9Aym5O7QYZFG0RtvE9nQk2-IpB_Pjj3W6OgY9YX2aloDzVuhuiI_zlutJAyyHIwYq8VfkewyZGl0qaac0bu0XnEbyH19FY4Z1eXLxtFpnnd35JF7xOxnPU2HZAJf-h4xIohBVO94M7R7K5uYP-H0qyIYInUD0IKOr9odqsSPrUyiQSU378uKCvJoQIYu7zz-jDF9sSYpmDmXDkwBFOypt0xk-RRbd5icuYM6ek9PNL8x3TiNZqJg_W5DS8eq18XsEsyvnRWCwyXt8QyR2POBCcZM",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/115443628794955633677\">Dude</a>",
              "photo_order": 2,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/a2192b69-cb69-48f4-9883-676df63bb417/1.jpg",
              "id": "297da7a5-86a9-4901-a526-a572e43555a4",
              "place_id": "a2192b69-cb69-48f4-9883-676df63bb417",
              "google_photo_reference": "AZLasHpJTP4BI3vYeor-9q6ECwNp2EsMCd6xytKGVfSdTKsk4M4sHzEscgjwVK2sgoqV0Cg84eHguokLaUtP7_S9tFTYQeR3o9o0D_70NnHzVktfn2VoEMHdarlks7kR3HCaBLeGL_ZjdkBi3XDf7Iz3UclAHFz3f7bYiP76kK0CzhPlQefebLTte_W0MSHItIEsXZe6uYONTgsQX9p0o5kpt4J8ixxK6ae7pl-18l_vZxjx37Mg9luTool_zglCHk3MiB3EwNtk--dTgoA92Ymsa2zwZAXpylfCkS1lBikIopHRTLiufi6EHa4I4oTgqU-02UWMH7VpyhPUBPjWJMN7jFQ8C2y5yyKuR8zFOQ4vwOYOzjXHasEEozsFi2z_cHVz0UKWOHxYm1U79uGxr_DF51RqCsmzYUU_3Y2YQx04_V1d_Q",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/100649193114778838246\">Craig Fields Williams</a>",
              "photo_order": 1,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            }
          ]
        }
      },
      {
        "id": "8fca2a42-1fbc-472f-832f-d596d9b89d6c",
        "trip_id": "817e87ed-adee-4a16-9c91-de5b6d6b218a",
        "name": "Hong Kong Disneyland",
        "address": null,
        "rating": null,
        "price_level": null,
        "types": null,
        "description": null,
        "display_order": 0,
        "place_id": "8b702728-7e17-48db-a402-19a32a7e1ec8",
        "created_at": "2025-12-27T02:05:23.000Z",
        "deleted_at": null,
        "place": {
          "id": "8b702728-7e17-48db-a402-19a32a7e1ec8",
          "google_place_id": "ChIJPZXTUy_8AzQRBVRH5GyvszU",
          "name": "Hong Kong Disneyland",
          "address": "Lantau Island, Hong Kong",
          "city_id": null,
          "latitude": null,
          "longitude": null,
          "rating": "4.5",
          "user_ratings_total": null,
          "price_level": null,
          "types": [
            "amusement_park",
            "establishment",
            "point_of_interest",
            "tourist_attraction"
          ],
          "phone_number": null,
          "website": null,
          "opening_hours": null,
          "visible": true,
          "created_at": "2025-12-27T01:46:48.000Z",
          "updated_at": "2025-12-27T01:46:48.000Z",
          "deleted_at": null,
          "photos": [
            {
              "url": "http://localhost:3000/images/places/8b702728-7e17-48db-a402-19a32a7e1ec8/6.jpg",
              "id": "f95332ae-6c35-49b4-a97d-998d6b8a6a54",
              "place_id": "8b702728-7e17-48db-a402-19a32a7e1ec8",
              "google_photo_reference": "AZLasHqZqGAXShGqO_mdMnPvndzivj2Qv5fC5NYJj-39CtpdRSXYiKg5kv2twZHsqGBgxNVRkan6rBT-feCs4r1JfRNCsTHqgBkbYtzNDF-pqD4mWlP-VM1g53GZ3vmfH-0s5xakCy53bwuiFLdEzRnO8ULL0qZiqIAy4p9QbIxVJWorMKqT8w31No9taXpd3RaSHLc-_Sqx3c9O-Qp9JP-81dPFI4WZZ6Dggmi-RfzsaSKn8hky1A2W3IgbrvkqXiLPeqWSx-_ZLmYko7PtXfuB0sIJj8TS-U-Ix5kwQHrq3UOQuuPUm5k8ckCzCMHa9QQi9lwtemk3uuE4oJW4GJtPrdXZ2I5OeCyiaRhL1Qs4_1J-FG1SMqSuzTPAZ8E1ikN6uapvo9YIHd_u_VTvbs07zzb8EfUNL3KcrwB1oBWRwS287w",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/114667656605822002831\">Madhukumar Menon</a>",
              "photo_order": 6,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/8b702728-7e17-48db-a402-19a32a7e1ec8/3.jpg",
              "id": "12d840be-ddf3-4799-9bd0-13123628a99c",
              "place_id": "8b702728-7e17-48db-a402-19a32a7e1ec8",
              "google_photo_reference": "AZLasHrGyAV6on8nsOhoRXXlJp8LUXESo1W_jDA-fQ_lZHRNzw8gHHIzT0h0yLgPWjBVVU4SsMQxL_kU8B3l4M45XWgdNmttX9anfQ1FCK1BGbCnFGyYRI5qOlJoZXsFM9hW6SFWFlYHObQnmMnIcxz07gvu5W_VcyPjd1CcsVvHhhKfhL3Z-T2bQjyoPSxyKU6Rd9zwgGTf0n7lElJVPChd1Fko7RsmjGWIPbEpENCzHr__S0nURBN34mW_KWr5UTMlFXNF8w9_MHhZ7yZAhMQHBMDn8Qm-O1WaFxfzpyZ98fOG_8Cz6BE_U9TFmXoHG2kvWCbHI8zdvQvfiDPFE1IYq1k9gXsNP9lI39cn8EVWmlsLuC5sF86XhKufi3XtOAUxwUbgVcu52XHe1KtwP1opYD8V4l-4S_lkkrkcGtM0ADA_6FX6",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/102195042047717590250\">今本成樹</a>",
              "photo_order": 3,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/8b702728-7e17-48db-a402-19a32a7e1ec8/0.jpg",
              "id": "a2f7cfcd-bdee-4b88-870a-54d586342174",
              "place_id": "8b702728-7e17-48db-a402-19a32a7e1ec8",
              "google_photo_reference": "AZLasHrlyKkp80hRHZbPRfh6Ld-tFmX6wu3U1clOfi8w0szpgfWX5agZVE0_ctaFaaeEij9Y3W0oyxYyovrSUrSnLIba63sqGMpXQnWrgISg8NZyS_KPZabmy4BO3bw3Jyd1PeQr1NhEI61OFeu98RrAT1kabQWylllTJpXzDAminssu-bZpK8zYVuj3Hq5oIe6gvMx6FuDCoTu_TPxqpZT0KVi_8v7zsWaA1LKBixl6P4nMGLpwXd2asJwMmKlljWAoh6Uh5sS6u37wR-wHwZP8pgcaGUtBJaIWQM523Kz9uMJNEl7UnU2vm61810d_7MAUTZXmc8qmTOD3SM3S0xgmlKB7sn5DLXnVZzmvvNMYMYUpXX6q7lt0oDZ5c19BdDdFHeA14ulXazO9iWxhuPCzudQ97PSvglbdBxrmCo2942I",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/113840672491033458169\">Muhammad Rasyah</a>",
              "photo_order": 0,
              "created_at": "2025-12-27T01:46:49.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/8b702728-7e17-48db-a402-19a32a7e1ec8/4.jpg",
              "id": "936dc9ba-2375-4385-832e-8066eafee668",
              "place_id": "8b702728-7e17-48db-a402-19a32a7e1ec8",
              "google_photo_reference": "AZLasHrOoEwVOxfckZFxWq21cgJr8lujA3TRwCDghKVAhxZKhd6TtSTov0-rMcyLh4-_gERyvuZiiEnnCT6jz8iwnISCuvQ9m9WgqYWCibuZjTdDK3o7DWWAQomVFbyJkQJQ59FWL9wnFs0HmKa6est3eCP1N2Ymq8c8ItLnkCjv4P3XuH8QojM0XpPN2trlyaB23JL2c8YwLZx-_qr0RAGwq3UQVkv67YmGgpdBQwKXe6M-yJO3Z47WIT7uWfKO2_MPiZ4PrGZhtyWZwb-A7eWA5SPke25p1kUbvOU3SOBEx8EYZFleL0wQaqTC3H390Q0NfGW4YkOTPr4_frqZ9wk4gJeKD2w5Fb7MrIGwdmcaRR8I3T9q63P3puOoDRjLMJQfU_AvbQvmgPNmLxWl4MQZR7mlxHnN1243xuoNspyBGX4",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/106142452125721871100\">Alex Lee</a>",
              "photo_order": 4,
              "created_at": "2025-12-27T01:46:49.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/8b702728-7e17-48db-a402-19a32a7e1ec8/8.jpg",
              "id": "13893d95-a2f4-4963-86ed-6f7ace2c4a03",
              "place_id": "8b702728-7e17-48db-a402-19a32a7e1ec8",
              "google_photo_reference": "AZLasHoe9s-ThnBnrmlAO2M63TSyc-qbubQddtj4OfKa4GHvYzIt7rKIXJUoqCATLrA9k8f6bkm8iYF6L-vYTiA1pmr16hSxMaoAXR9c_Ty0f1G1OFNE0fdgKc8qw1ck_SXt42oUef8YG5l0jU37WR5swgUXUvckCso4M1WF_Oa81wNCJLAJpzdd5bUWwylqIfCgn08-UmAm_qv00P-Eze6zVmQLC8bf3Rexp4bTr8tkwGIbd9HVwY5wG92MJOwxOaqDMY-NNog5h0GAPkL2VzYIflfBglHFuygxewdI6k0_mz3GPa2-bC6Br_g2vLv4DRML717MyEebj6We38gMufXoEq2gaa6XyS8WYoEbuAetsPqNhiQqEPywFsQUIJDG0C7_14xZJWpQ5tlzLTaMzGbGlQVaL_azSf2ni8z5YI8Exv9s2xzahvXUxTQvkngYSUNN",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/102094385369366763530\">Win Robes</a>",
              "photo_order": 8,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/8b702728-7e17-48db-a402-19a32a7e1ec8/1.jpg",
              "id": "ea2a0020-b0f3-4f60-87ae-ca84a953bb49",
              "place_id": "8b702728-7e17-48db-a402-19a32a7e1ec8",
              "google_photo_reference": "AZLasHoFPvGVHZSpZUM3SmN-DgDITFqTM1cXbSeK_6XZNC88IAAXDybnC1nP9vq-23LEUUFbOeIm-22CFITHgHy326X4GWJ30nPr1wUdIlQBFGpdkJFTwh670ZsXBhjGc5OV3kTd4WiYvxSVN4DvPiMQ-Ickdwd9RSk7I3Nnp02-pt6HpB7pOEcIo7aclreEkZBLdcE8V1LNF6uUwgeKZDNm2SjYB5my_DtyQPj59TcbfMLeGOhUG_KtilBQCb6rDDx3YQbbX0bRa_esgdrsd1hGr1oHI7TOUtKGRtLPE0IzSFdhuYpXmMpP2IhoUD31zNxozBUfi8VE5ws8C4PV_6JbPIJPuA5XTsiB0zJsgmeZiBkRKvP_EWhVfiQg9jrxTNs9jlYqrxhDQN0mgbOkOrXc4q20t5ccj_3VPKqMnGMMpjxVIPoK",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/110248996998710000208\">Roesli Roesli</a>",
              "photo_order": 1,
              "created_at": "2025-12-27T01:46:49.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/8b702728-7e17-48db-a402-19a32a7e1ec8/5.jpg",
              "id": "09181de4-491f-4086-998e-76b68d13f517",
              "place_id": "8b702728-7e17-48db-a402-19a32a7e1ec8",
              "google_photo_reference": "AZLasHoNEzS7HLVqXEkq4WfVnvoRVqhAIr3hOVlOSvYDJFfce_lmIYrGtwCD3kHXxPuZN1LRusVE83CqcjLXfJ2_RMm_7ViPOUUZGoPt_V0F6jafuXCnfmnRQsAXCdEID3UN3Xp484jcnuTzqsbf94fm4pjuwpQnyTgPFe1mkd0T3f6AXD3owtFHjbnqw_dNY55fAXnGF-SKV_erUUFUAQsq8E3WxkixhQ8Q011H-B1bf85RkxLq2Q1MON6KEo4vnpxP0EgUIP7QC9sUsCtTktasmZKUsVdQB1tAKLK9K50ufbMAc6DfK1ZyZ1_btoT3sE16q9xjx6nZBuECKaXhTD-oO6bKncfYHOJnDqsXB1LdWFjl7Roeh0BXOK1zVQDPSIfyINKuw6bbSt6n-s_hUtekRABfUJjnCJsUD7Dd0Tfh7pghAgw_",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/108452660839935845000\">T K</a>",
              "photo_order": 5,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/8b702728-7e17-48db-a402-19a32a7e1ec8/7.jpg",
              "id": "31a07357-1ef0-4e46-ac82-9064f9febb67",
              "place_id": "8b702728-7e17-48db-a402-19a32a7e1ec8",
              "google_photo_reference": "AZLasHowRtP7PJBYt-sv_NoHv9mPLUGqFX6G_-Td5dIBt_Q_eICqdzvKZSpqE4DqaA7U8KujpypVPhJzK-rxQzXaW9W2i0o8IHh1LvKXM_XCi9bD-xuPjLEB0OCEfrOmHaAZpNiTN6FZP8XrvD7KQ19-pHkGJJZwDuN33F_YV93L05a3ZYxIWH-ncBy4N16cdXpoKM-oWJRBTDJXcUhAARc9Av7HCjStR1C6qPBkh5BGw_Ac09TCerEmWfIFkTDdTQlVgLvjxluFJVx8h9Hi8eEcshQpkXCNPb65nZfOIhjWAMgNncDYoHOIN2O1EpgGSUOBTF-9eU3OYc-qv0AKsYyG7NFgcojS3EFHhTVTiCqjfC-v3c0DlzI-mvP84_mV7F2X6rHLOhBXStbbTk5KuJwRiIUc1vYOdXHF8hCgJ9qBJ2-URJg",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/117889420364973150042\">Jugnu Ghuman</a>",
              "photo_order": 7,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/8b702728-7e17-48db-a402-19a32a7e1ec8/9.jpg",
              "id": "67d66fd0-c16b-477e-a99e-169b9db85c0d",
              "place_id": "8b702728-7e17-48db-a402-19a32a7e1ec8",
              "google_photo_reference": "AZLasHqTzJgMJNzz136FGA2EXD9aHRqqTPDM6oA8Kwij-la4fWjYGdjCqqALlOMHZhYCpS3BMnzvskAuZ8xzGmqPx80_JozQ7UZS3dx7NpBGAdBcGdD2M0xd9xRa9Z2Hb_ciBgmMgx23OYaPswrVqhnv6ZwmUcJsXqIGs_dNtlCaJr5kudyu1tNaIxEwb58mVHeWOJvJyf5g46J9jf9eMPFSolIvB9EHEIFg7GyjjtztCbMwhcZAN4wddSVosvKqs4dTrA6I-HzC311UZz1YMntUZmVZ7Qqp0Y59CY6xXJFH_CNU01NbQsqaJlBjPBlKwRJC-yvo6OQgWGBlXFYqvnuq0PQbHrsZ_0ZPpIIeBL1ewAqGSSmk5zbvrR5mXFGqhRg8PRJTpLQQe2Xe2F3gYm87fFk9kOfsw9I32zxAtRHCGB-VNKs",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/102700126130985159008\">Ronald Tse</a>",
              "photo_order": 9,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/8b702728-7e17-48db-a402-19a32a7e1ec8/2.jpg",
              "id": "c2356abb-2999-4744-b00e-c5b63d1ef993",
              "place_id": "8b702728-7e17-48db-a402-19a32a7e1ec8",
              "google_photo_reference": "AZLasHqX50IAVH85bXXyg2j0ooLYR4Tfu160mxjiVNio1ei9xRpIOCGvprAqnU3iZUAaoWAH92XCOOzVIfx_Uv2f36vesY2qncu1-zrrX5muroDd6i5rgu0tKMjferlJ66N-Z-Yud5BuXClKH5hLp7pVxGvQi0oENsqsyu-rTAHcjZ_sfeRASr0i11TCTTI9wpctjoT8jjGVWbLwMLU1UjcT_O5A1oMznxu-YMvLpbmQClfNPi3Z4ZsMZW4zFh-WApQG9dAond3jnsi19G7UK94_egly9NLvYuHhOssqz8lqf78Qn26FUTPSmmtaG_GITDIl6aDWBPTteKQoxWbTqnHfIouw6_0ismbD-JdsKR3aUnt7XoQ1oZjVCiwvdJhHK8MaQbQTfmjFcfEpqlyD_1O9HdL7xF5h9DsicHoBkfVEE668hb3A",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/107389040669858983776\">Indah dita wam</a>",
              "photo_order": 2,
              "created_at": "2025-12-27T01:46:49.000Z",
              "deleted_at": null
            }
          ]
        }
      },
      {
        "id": "5b100aaf-fb12-4a46-b007-a1e459b7b239",
        "trip_id": "817e87ed-adee-4a16-9c91-de5b6d6b218a",
        "name": "Disneyland Park, Paris",
        "address": null,
        "rating": null,
        "price_level": null,
        "types": null,
        "description": null,
        "display_order": 0,
        "place_id": "af353ecd-a1f9-4c42-9c4f-b1808a4ce80f",
        "created_at": "2025-12-27T01:51:14.000Z",
        "deleted_at": null,
        "place": {
          "id": "af353ecd-a1f9-4c42-9c4f-b1808a4ce80f",
          "google_place_id": "ChIJf9hphiUd5kcR5RdeomHtvFA",
          "name": "Disneyland Park",
          "address": "Bd de Parc, 77700 Chessy, France",
          "city_id": "ad3a0ba9-5699-4b1f-92df-35d9a4599bf2",
          "latitude": 48.87105,
          "longitude": 2.7788007,
          "rating": "4.6",
          "user_ratings_total": 49594,
          "price_level": null,
          "types": [
            "amusement_park",
            "establishment",
            "point_of_interest"
          ],
          "phone_number": "09 69 32 60 05",
          "website": "https://www.disneylandparis.com/fr-fr/destinations/parc-disneyland/",
          "opening_hours": [
            "Monday: 9:00 AM – 10:00 PM",
            "Tuesday: 9:00 AM – 10:00 PM",
            "Wednesday: 9:00 AM – 10:00 PM",
            "Thursday: 9:00 AM – 10:00 PM",
            "Friday: 9:00 AM – 8:30 PM",
            "Saturday: 9:00 AM – 10:00 PM",
            "Sunday: 9:00 AM – 10:00 PM"
          ],
          "visible": true,
          "created_at": "2025-12-27T02:16:17.000Z",
          "updated_at": "2025-12-27T02:16:17.000Z",
          "deleted_at": null,
          "photos": [
            {
              "url": null,
              "id": "6f724014-c92d-4d3b-83db-fadc4bff493e",
              "place_id": "af353ecd-a1f9-4c42-9c4f-b1808a4ce80f",
              "google_photo_reference": "AZLasHr7oOYbPhYAkGc0sX3_o81VSQmGRdFUiUKuDogENXvKm_MlFEconvNOcdFXZazcuRPRm_tSIdAPqCPDJQ1PVVDQH53FJPtLz5CL-50OSOGsb0t14R4iBYs6--ebgZTjUYhv0KxSBnKewuWgp8MGohXhvBfinWg6HcbTGsNHUaCzFtnzF8PdUOPHKeckibiRLtZZipM-_sBe9imJLXv7VyvDMzg0i2_94eJ7jI4G4LHOqK6PN0oponHDe5xH3qyo_Dni02bMFIgTx7QFigzSO-1wF4dcupNzcEe_6J4ISPwYuL0m0kPVvZGNiq3gKX-Yz0X5F2NbHWfDIkpxnvnspy2rczpCHQbmSjLBxq0FLAJalKE5aimSCYGcdVMv0wWx-uQH6iP9VSI_8HLGbst_3itNadCHpG3V3Nt3mJ9Dy_yx-4Ay",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/102090892376007457078\">Daniele Tonoli</a>",
              "photo_order": 2,
              "created_at": "2025-12-27T02:16:17.000Z",
              "deleted_at": null
            },
            {
              "url": null,
              "id": "d7a20c61-b47c-4d23-ba9c-a3141fdd03cd",
              "place_id": "af353ecd-a1f9-4c42-9c4f-b1808a4ce80f",
              "google_photo_reference": "AZLasHrN6-qKfBvJHFbJhdYtPeJJlIyMktwdcgd8sKxF7z06JcqbbFJng2eH1bAdP44Mm32W1FrcGM0MfrTooAE7Dm55_XVX-GOWMs_LmlW2YKsNECGkZAuj1aw-3YU9tKTcDRzswhXi1IPuv_w9KzrCM0T1o1rsaH-GDFZF3rqcgtiTfzGqL1DA0mPz2DEqI0FL255bcPk-1aCMt6_V5cecWYRE13MgSqC1MOYz3o0QUuyMZRInhmmli9ujj0sa8Tln1-7-TCME_05lY6FCnb9e-_8g3eQjbL5T0AYpdQGQEkyq_NWI6T2l-5eZ_KLEpLiTqpuwA6-7FdQJoLKgqHweXL3h7w64rSMUhqKFDstCvbVyYXv7ns36tV1VkWQkp0baSNM3QmZn-sOCkFwkolsETUaQvwMAutVNNFtxJ2xCZn8",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/103715684256407217334\">Nathalie Romijn</a>",
              "photo_order": 0,
              "created_at": "2025-12-27T02:16:17.000Z",
              "deleted_at": null
            },
            {
              "url": null,
              "id": "c176a4d6-be78-4019-8ee3-93919323472e",
              "place_id": "af353ecd-a1f9-4c42-9c4f-b1808a4ce80f",
              "google_photo_reference": "AZLasHpaZCjyQaAodyMGWFY_fSmppa7Beeu4Tpy97v4vyRNRUdxxYSexWqDRPRenphWAUEAfWyilraqD0fvVSwtqRS6lbZv4hvAMiD6a_pmxdr2bX2GBnCmIpeRxw3WGxEFVJMLp40nev6YjFY4aE5gKOYvtK3k99dW9r-LQ_tVyCMJeP1sQOkpjvcDSZl2AcbrJOdYYJM6QGH9-Hppxp2-BaL8J1ypAwD2BRBTtlE0LbefmYdeE5QLbmlVSCBL6VIeWCzlFH_YB2V6dSMX0AQSUAG95PArwx0442sXoXZ6YbYsfZOGlr6yzLbG30tT9UD7N6r7RiyXz1GvuJdtWx5t9CbxoyY22ptzepdzG8lqv1F_INxIalyNU0OjmzOrLJ1GjbDV1uBUo5e-lPO4os6gXsRsH-YqynKOJak54XN-6dnU",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/103087625552298720859\">Eric Lakenman</a>",
              "photo_order": 8,
              "created_at": "2025-12-27T02:16:17.000Z",
              "deleted_at": null
            },
            {
              "url": null,
              "id": "3c99dd61-2dfd-48b2-9ddb-9d32e90912fd",
              "place_id": "af353ecd-a1f9-4c42-9c4f-b1808a4ce80f",
              "google_photo_reference": "AZLasHq61PoqB48lnuTfDPh9eZcqFnZM3xAqNI5CVKXdkiv-zDiJTt9j5U6X6F9rloZK49UJ4AEMrebrKFYER2YtBcaJUp06QEZsUpfyBaQqw6q9046FLDIqSZoef_T_lR7kb9fUFsEIPT232zvtAGKGjsVTgFOmY1VzcWeGEX8VLGl3OxRsdvslkNDjgWR8zhuNA-mObNphjyC4PbDbLdVv_-viSunA0VjqXm7ZBqxvym1gdX5wmClK1alVx-ddIyptKD7Eejhw8vsM0hG9caBgeROAGmbCtK9bSbwSwU6fgxfPukjnVqoyGpZnuWGYR7gba1steNESwn6OHLkkgwHPHWTEF_V1IIIZfVitJRH4x3J-APFTvDbS0rL91jz6h9bfbB9iwFpZ-yfW-V6RmjHnlsAR7JXxDMpJnBkuImIv3AyDFOil",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/109432422709676584483\">M. “Mountainbike Rider” Ribeiro</a>",
              "photo_order": 1,
              "created_at": "2025-12-27T02:16:17.000Z",
              "deleted_at": null
            },
            {
              "url": null,
              "id": "3ba44c7c-e4f1-43d9-b260-fc8aafd273bc",
              "place_id": "af353ecd-a1f9-4c42-9c4f-b1808a4ce80f",
              "google_photo_reference": "AZLasHoJZX0hYYtkY2Z38MM-ICltH-9HaJZ_AZjYNOSORtiTF6Su5X5anRAEEEZHmbJJZf0B9whNBcLsL6iAidW1auLDJDWsFGDDZrGN5mNj5avv96DvEUtPN0lbQkEVvkNJk2_F8wENqXpm_RndgyAOt7zvmVEuzfXdTnu_NCFJHEqVxMEp0lsxfAolKdn2E8h8i-uHfPq5XcLFh_5J-UItByr2cmFPJC7bjTIlpGISndugVN8cnDRq-KL-yCPc_FrHdo-7c-pvDWv1lFO6xfNkYKIREpBU4PX6KMbg759xvVqZZerNthrBlqq6SG0-Qq-pMxMAzjNRdA84ZPcqK3uzvVa0lth-7Ar4jSQ0eOl_Yeu-vTA3--qGxOOeCvK2pT40MfuWS8mTcLUGd_x8A3hgLRYFQfFhFcOpV8Z8nDWiQFw",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/100107698799448284265\">Caleb Neri</a>",
              "photo_order": 4,
              "created_at": "2025-12-27T02:16:17.000Z",
              "deleted_at": null
            },
            {
              "url": null,
              "id": "113478d6-1fc4-425a-8980-cf098cd715d2",
              "place_id": "af353ecd-a1f9-4c42-9c4f-b1808a4ce80f",
              "google_photo_reference": "AZLasHonx2ADXyjsFo5Mtbl7H6KvchI4qdfJvDmTrzrEr0cUhpNekwyPjlk4H_hTsrm7xd06u_42mL6O1biVwmVYxTXe9KyML2hmn7HMdGSUkMq6DwreEIvuJfOZRQXIYozT7Dsaz9QSUHfEPxtsQUeQlFkKTBlQQZpyF9j6NciMpNWxNvujQgxz5scgTVAmNjY9EeuiGjAIjky1Pl1005bkr0XjogeSfJbRqZKEsTRm2nHEIoQ-fIc8AEg8dNUbx5WKzeT95rl9yIGcQShXuEfsIVGlG9YoqCy-2j4YS3Y2PcWRDZ4LatAxtK67Y4junAS70LzBUs_wcJwUm9zt4CNzqBkkuQvQ1aR1dl8rziBRKHRZIiLafnWGRSl3b0mTEEvH_dvt3tJTQh2tkuReXh0s8vWhWt4GmOBiJ-DlLj0C4mtpv3w",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/115012502908539770451\">Daniele Morelli</a>",
              "photo_order": 5,
              "created_at": "2025-12-27T02:16:17.000Z",
              "deleted_at": null
            },
            {
              "url": null,
              "id": "bc4f521f-c6a0-46df-ad58-b8c9f6774e29",
              "place_id": "af353ecd-a1f9-4c42-9c4f-b1808a4ce80f",
              "google_photo_reference": "AZLasHoZFAhDZp-fv_Nfdq0TkDjUnAoCpQaTwWKkdtlBo5eI28zYWXkhCOn-7FRlv9eUn94Cvvl7PIOmQkockVuWNkezEH5jFN5MQu9p6UVfTmtt-3d4wL6HTup9FLjAlSlxU2ryCctwTe5jwu5QrwFWkqs3CRm_DRpFR-lYikbAbad1iXLNSyBfla64ps8Ub3bejRoJ72vAOLt5g-PqmXfVYmsGzlNBK41N6vdVa4L7u_Ixx13AVXM696OM4kNWRGrOPwNvCI3nlIlHiJ9ohBMuI_DS3ioQiV4CPqxKEiMPkCHyOFZH62IcLb77CJHbJDz5p6hhr-7PIS2k58K232SK9TWJHNWY2vyOuDfE_0VY49mNZi2cNEi5Gdf_dfGaIyMejj25_yhsglkf_SgBTqBCRjUMEqFip7AYt7tGPgVOIF7QS8RR",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/104477788034431352182\">Patrick Hartmann</a>",
              "photo_order": 6,
              "created_at": "2025-12-27T02:16:17.000Z",
              "deleted_at": null
            },
            {
              "url": null,
              "id": "fad01a60-33a4-4fd6-a30a-db24a92fd116",
              "place_id": "af353ecd-a1f9-4c42-9c4f-b1808a4ce80f",
              "google_photo_reference": "AZLasHp8htApIOnWY_LDIL-CKfmHTCJCmVqzzs-nP02StPJu7u0CmCO6rDdK3wLJ-7FzeiEHJAdLWKjsMMhMBz_puF--V-BuFHNvvOUn7_m9QsTCQWx1iOz_rQ0_CYhk6URf1BciruKGfU72GW1mHjBsCTjL52ad2jRujXudZiL6A7a6vW80i8Ti5WN35HxFc645i7jJWXu4R-9E3VEoVpcGienmjCIrozPfryQR-FaRtIfoXAeegsedMaDYCOS7zY24XDNZSlL4tc3pvNHUm9bXaWRT9KJONINbGKGh2BKHGlsBQBdV3AB2XlIfw3P5bh8xW2UqMiwVbMxTukiT--Oo15pIkfWrmX7FlfB7Ecr9waco6BzhHNnLbRgXtkKEw6wWdOiwZ-YNvyLY4dKFcjzSGs63JCXLiR0lUNL4-uKTCiVRQHUK",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/116202385941569497881\">Jessica Ramos</a>",
              "photo_order": 9,
              "created_at": "2025-12-27T02:16:17.000Z",
              "deleted_at": null
            },
            {
              "url": null,
              "id": "2e9d97a3-079f-405a-b1af-f7dc75d5623e",
              "place_id": "af353ecd-a1f9-4c42-9c4f-b1808a4ce80f",
              "google_photo_reference": "AZLasHpANJZOKvtqQAJ1vDlPSomhMxXDRHIbi5rCd6R6e0oasfjALTQddXar-lNhjNlSz_oF7p4Iu94xMAk6hrLHgYRfH05EYnLTiF8tW27pPXtRb0YEVczM0o9Q2HoRJCUCD_7Dpsfly-wUg_6GZB0unTYAGA4KqWg-eJWBHgdH22dFtPFQ481U9vqYfC2Tu2fLjrqe6F0VmPWd_ceyYDUf8Top8HmPAJx5EkRd6-lXpWKIElejHxtGujUpdDv0WJUQDGYKcwBrT3fCTGnI0eYynptVCbtFrT1REvABJu_Lk2PFNEkEAsJzY4d0c9DmZO_2h8vRYJLyKEJ7BKXD9E-J4B5oCcfu9iHCIHY6hGbNR_Frxxfj4-PJpPTVamUiIQ1MEEz8ixSQ-nD5upzw8O9PrUJ5R5w4tuzO6GuNhmAh1CYonA",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/114752344835449779392\">Patrick Lenaerts</a>",
              "photo_order": 3,
              "created_at": "2025-12-27T02:16:17.000Z",
              "deleted_at": null
            },
            {
              "url": null,
              "id": "8d4f735b-a4d1-4f0e-adb3-7c5c31ad8d20",
              "place_id": "af353ecd-a1f9-4c42-9c4f-b1808a4ce80f",
              "google_photo_reference": "AZLasHo4Trt9Ib7tWdkYB7KTbxFk09LKuGNXkSFdv8ITPjferEC_MMkMdVDfT5lZu7Bi09YKyul8GcC5Pig4IkthCR7Pg_jlWuZP1PLvL0-VvmaDd46WcQ20s7E1Oy8T-CLp7NsRSwxgzGhEnFLMe4Y0b9daSk6qAk-urnfxUnEJYYVIm31AvxIeEdov-Ca-Nch7xp5fJsIAZn6kkPeW78AIERG9XtmWjmWXET1irX8cPV0D6ym0TmhSmlYGhk5sW9gZP19gdBr-9RfAAJYWxHzw3YnCWnpDFQhzSe3ATNQSScqpD4Bh4EiIoy98ErWqB8aBxxwgTdLlpcQQWuQ5oNaTJsfFy8WiFOEPIr-V6QNyF_2jiPrlDaz3PwyPBV1lhH6APkpTVYWDJeOzWhDtQTqETT9-0CHt0x19p_JoW2AKX6Rx9CSE",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/109047214850988044166\">Mini Mickey</a>",
              "photo_order": 7,
              "created_at": "2025-12-27T02:16:17.000Z",
              "deleted_at": null
            }
          ]
        }
      },
      {
        "id": "2ff38a2c-9951-4f3f-bd67-3835a4713ce6",
        "trip_id": "817e87ed-adee-4a16-9c91-de5b6d6b218a",
        "name": "Reunion Kitchen + Drink",
        "address": null,
        "rating": null,
        "price_level": null,
        "types": null,
        "description": null,
        "display_order": 0,
        "place_id": "f317b0a4-8494-4212-8c5c-65fab1b59e4d",
        "created_at": "2025-12-27T02:03:19.000Z",
        "deleted_at": null,
        "place": {
          "id": "f317b0a4-8494-4212-8c5c-65fab1b59e4d",
          "google_place_id": "ChIJKUoN4QHR3IAR5mnJYgxqytw",
          "name": "Reunion Kitchen + Drink",
          "address": "5775 E Santa Ana Canyon Rd, Anaheim, CA 92807, USA",
          "city_id": null,
          "latitude": null,
          "longitude": null,
          "rating": "4.6",
          "user_ratings_total": null,
          "price_level": 2,
          "types": [
            "bar",
            "establishment",
            "food",
            "point_of_interest",
            "restaurant"
          ],
          "phone_number": null,
          "website": null,
          "opening_hours": null,
          "visible": true,
          "created_at": "2025-12-27T02:02:59.000Z",
          "updated_at": "2025-12-27T02:02:59.000Z",
          "deleted_at": null,
          "photos": [
            {
              "url": "http://localhost:3000/images/places/f317b0a4-8494-4212-8c5c-65fab1b59e4d/0.jpg",
              "id": "a50847c3-7079-47c9-b7fc-4ba0d898770d",
              "place_id": "f317b0a4-8494-4212-8c5c-65fab1b59e4d",
              "google_photo_reference": "AZLasHo0J-Gix61lxQXGyYt2WmO3WO-bBm20k7ZKynCkKLbghEpLfFXrCeqTEx2Vcfz6lvd9OB4iKpsSejHPv2QWg9LqXBCqB6JDgfzTnceT1py0zqko9TwkItfAShEzm6DHUidyj-Y5fGWReCGcifjZgQGSDJ3VcEr984ygY4R2xr_o25Q7wXp1AFH-1HlsGguVN_FxrRVlTce6tXrITUIdtsBZsLUBTpIqw1shOs17GpgsX8qByL-nEJSMY0ZPdnB4So_nylBB2rVtKi-8uESR-a4dqljDmSaOcLA33s6FNg0j31_bz-yTcFiUSSo_SbExf8i4EbOX7AHSIUb-SVWGbm6099Bt4I7X6-OcxRO7VsgoB3EB0tWF578HFcwFLpvs27kwunDx3xAFeqYnYPLC8OM0Zdbrkd2_ec8YZeEn_-msOQ",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/115004900065174229002\">Ellie Manesh</a>",
              "photo_order": 0,
              "created_at": "2025-12-27T02:03:02.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/f317b0a4-8494-4212-8c5c-65fab1b59e4d/4.jpg",
              "id": "1033b933-91d3-4d55-8801-8c4404721165",
              "place_id": "f317b0a4-8494-4212-8c5c-65fab1b59e4d",
              "google_photo_reference": "AZLasHpbfSYfIFxwBOxa3QOviHP18LtmGrwM5TorjFv7N143xtyhCCZeE4rXrQ6buYF0osjkEECtCKBoW2lrDjaj6sRZr2cUv3roJIgQkRaC2UllIyPesbRFNTSFbOYH61dSDWO-1TPvRN__NV4mLQQopVmtnQgvwmafmMAOc5lNm3Sf5igQl3D_rnNqiPngji5G69jA2m11bAryPQQIdUn4tcuz2VyMKpaqeLriTlQkHU0njsN20zZ5Ebpb2t1hVGp7LXtdUz5mYhRV62VKuPnEeiA1SFKLFIjrt_o8nZ2-ORPgzXGBCA1JnAjS2TJWGfiHrKoAyDEFk_WXvxFzve-e8KTQrQmKEqCU8pKEcZkA4uabsvUVfbiQ4HIhsuEcu75l8vX6vcDbNQpympb-GlvREEDzsysxjZXtS9X3L7g5SR-wbA",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/110919135385696323471\">Gavin Zau</a>",
              "photo_order": 4,
              "created_at": "2025-12-27T02:03:02.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/f317b0a4-8494-4212-8c5c-65fab1b59e4d/8.jpg",
              "id": "641c4106-c2dc-4169-93a0-cf7a83ddf3f1",
              "place_id": "f317b0a4-8494-4212-8c5c-65fab1b59e4d",
              "google_photo_reference": "AZLasHprBRt6HxANfh9Fyix3dY4GT98VaMhpyBJjE8NDQr-a7yN7QRVsJRJiP0zksGEEVV6heGhj5y0z24NNfJxdrTT437Dns-iG-jnO4otLgzmaqkxe-_cOHn5q7ADNd3WGfpVbhVDxo240hxPKFHME79MuGIk5cLzmt7cMOJf2jAiOKQ3Ck_IUHT1-cjIQvWjZORUZJbNfke6n5lDojzjF_-sqEDsjT3yGL-R14uBFUo-7YlfNmm47HJYansufTRg6jBIt9DtkGardtPSrpgY8bhYXnZJeF5gnoIq_21_-5bbFDQDO9hodKoBk-tE4vTcDpTV1wlLi5yaG3VuMXO1CATdOavdwXVq23fYawhuoqscULOgOa-a__87e1-MOk-LHi7RxcOIojyC7eIhVXxirSFxGprPaBQWlIGDInwG2hYNHbRKXPzPDN_SUAwhvdw",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/104355740743816446102\">Jonathan Blanco</a>",
              "photo_order": 8,
              "created_at": "2025-12-27T02:03:01.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/f317b0a4-8494-4212-8c5c-65fab1b59e4d/7.jpg",
              "id": "c7211f1d-5210-4557-9671-2c55da88475c",
              "place_id": "f317b0a4-8494-4212-8c5c-65fab1b59e4d",
              "google_photo_reference": "AZLasHqdg1U5PfnndjX5go64RM3DXJYxKbhmRhbw-lqJt7u6oSHbS4UP5Z0hRMpzTNjXeqsZ_r__KtjxAPJac3gnPw4P1EoSplyWM_A8Jd_WWioRmqG7XQmwTXqHr0TUKslvwcG4eGrOe2HcP2HvNTcuOO2XpiMd5JyVbymyBsOC-9hDeg3-eMP0aWBapXnsFV5mTKiUV8Hr--MWEGiEJ3iwHiRjzf-elc7ihYgwfGjuzGUWewNRs81r5On-_iCrra8dcfNFQNf5sQpHNQAENQZpSVzzssZ75rDNxeUt4kMkY4RM4ppJrkBBgwIRdV5VrPGsb5CKRjJvYWpoXBY5OIjty02qt4ebGPuwfK87fxtHaxXivkaC8L6LaYN64a5CrZ-_-sbbi0c39N43dA8i11TC6Db9IbH2jPnr5nE8yGF9A22D5FsC",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/102225347688386753174\">Eric Christopher Buff</a>",
              "photo_order": 7,
              "created_at": "2025-12-27T02:03:01.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/f317b0a4-8494-4212-8c5c-65fab1b59e4d/3.jpg",
              "id": "d70e4259-5a72-4a9a-9057-ab97e8e1dabc",
              "place_id": "f317b0a4-8494-4212-8c5c-65fab1b59e4d",
              "google_photo_reference": "AZLasHqFnb0bfftNPECjUPVIUM3rNWHMWhf3uzezgkKChjtSCb9vSIZUGlMZMVlT4N4zVFPiByYVwLfptxNY8Zx29OakApldLOTG9c98pQ1aS5pX6v1Yw6HeJcck79GxfgtZOnUdjdi-mBD1n4B6TKTxr45oOpY6dxhBymn_pvIiNMzDkawQgFDG9Px1eWaMxNojYbnNsLRs8orwS-AzIdpi80jt_uBE4vxVHnRqOY_PDoLCWzsDV6WYuV9N9sJGjxRNHhomwrO5cSDvm2nVNVk7O4Ljss5jTfIE8sEdhyMOfJHsP8rB3BI730k_ZvYjOCI6oWTmIiBVTOlkeGAMSzrftqiTOGo0yfGLKR6zGY0I09mmr0quVaZXcfN6cwdCCP81zi8aZ06IIRLqvoIeWAvXSsJupc_M41_gGj2Ye12VC62z8AAejQJ__YywieZe4EQS",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/104355740743816446102\">Jonathan Blanco</a>",
              "photo_order": 3,
              "created_at": "2025-12-27T02:03:02.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/f317b0a4-8494-4212-8c5c-65fab1b59e4d/2.jpg",
              "id": "359f0e1b-7887-40e7-a21a-c9f1a311cfa1",
              "place_id": "f317b0a4-8494-4212-8c5c-65fab1b59e4d",
              "google_photo_reference": "AZLasHqJr6M6giTTi-DVnwfzZu-brw8XFioRVQ-j_01pHPYeMxeN3-adBE3tcEKKGBK8QNgxr-Aym2qaH1IcZXzWU7mLnbdwEAg5qEA-HnrNSdfHhXRu4qzEkxRGU47WGS4nNg1tCrhXgJZhKaxu8LCOCLZ65lG4hufZr_fxNNWhdDJhzFe2OXMmx1CgGnJdF-yKWKePba-r7Ao2HORAa_0J9l6hYwcM15itkB9GgXFjBEDEQt02c4gjbOqcBIz_tW3GjpvAepEzIXh_zlAgSq6Tiqi1aLq2I2Y-urlI9mqjUOp2tQuuN_ba3lUIwZON865-LYnry8WUCrDXClRMGnokALNwde9V1Ded723YUquHFAvwrTTvCNstCAipfLJ9moyeqFGa41IUZxMvi2813gqm2GPoUfF611lbWmTsm6xpd_Fz8UDw",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/109032152868006589685\">Phil C</a>",
              "photo_order": 2,
              "created_at": "2025-12-27T02:03:02.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/f317b0a4-8494-4212-8c5c-65fab1b59e4d/6.jpg",
              "id": "2d5faff5-bf54-4cee-a37b-72b22837ad62",
              "place_id": "f317b0a4-8494-4212-8c5c-65fab1b59e4d",
              "google_photo_reference": "AZLasHql3yQX5EZxS9QhPa-vSOmkHUwFkncT95fZfFTD1n8MaYkO7OIp9UqJVx40N_kynwJNGeCoB3pdDPjNITEkFnOLnPnIDJ1wvBIRwnwTBSYINi2nsKprKUxr1_57EO_mtWFO7htxKUUzxopm9_-77L6c5fIGuVao_N3uHq1FNe4SQD1o7_8Ac6-EZS5hp_rjigb3vlXbgIo_qBtstNOMqgk2ghO7zRlJ6AjqrTUDHs5Cwsfa-Q4jaT98ueKtT5R4CLQI4vQZyQIi2-XitHNL0OJLKyUKtplR5-H9ZKh7hW5Q8RsIxBU2HWKRGPVMhCkd20qT5A8SiRF1iaE_g8FAQukHsHQcOQxQQCLj3RXHhLPkGyy1sL8L87FZ6SHJY_biMRWy65uk-pSZtYv0XTMNvFCF3q2QcDX2KoI4S1-rOFhNaw",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/110919135385696323471\">Gavin Zau</a>",
              "photo_order": 6,
              "created_at": "2025-12-27T02:03:02.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/f317b0a4-8494-4212-8c5c-65fab1b59e4d/9.jpg",
              "id": "a06a3214-d73d-4c80-a7d6-5904e8f49ee8",
              "place_id": "f317b0a4-8494-4212-8c5c-65fab1b59e4d",
              "google_photo_reference": "AZLasHoDugzhY8wHl9uDiy1WHKMm1OCMLTYBnmT1HYLj1gAakX4ki0F8PQPhwaUzmuwVtbsye2TSBlbSSfkrVx-n_RAobC_AcyTh3j00ys_TTvkpUUcgkiJAiSQOjE6x8U56tdUV07IjDD7-M-NxrW4WVnuj5zgTS6dXzk6iu_tH91ZrLVrejQ4hWwKsHnnqliOZO5VdFYq4bEuTviX_jVjtwdSYDbjvLEOJyhQQ4yQJ3RPjWfSS55bcpNFRNKvWYtH8MwxzRWok7VnmBNn5nvUytowzVPfcEQ1op_G8-HxtzGW8vHcdkNTlTCPeyjiJWAKT9QDWto2NitqxraG0yjPx7vKtgJiCABqIHamN0-9bh7d9ySESFrIHDEkGBzxmCBhe7v6onmRE2tLS6-614kJe4QlX2eIlTLcqXwRlIKJMiT67YjAWIDuZ5ZnwkyOjozMy",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/112891996081593692874\">Sean Collins</a>",
              "photo_order": 9,
              "created_at": "2025-12-27T02:03:01.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/f317b0a4-8494-4212-8c5c-65fab1b59e4d/1.jpg",
              "id": "a316f065-e3d1-4a39-a344-49e9ce250141",
              "place_id": "f317b0a4-8494-4212-8c5c-65fab1b59e4d",
              "google_photo_reference": "AZLasHotqjkKA3XDTpx_C6oQo2k6u-1n6yb-ccBwbWJT_YMFB7R_foPy1ujlqS3HEDApwaHkkO-VQHTHvDGgc7IN6iwyKoCBZAVqZ1zQPoxjiQZC23nskVp3mv3zDsLU9RETxrHEBoMWkZ4qjzqPy_Efjkur0WdWmeP_X2_wKNR7L-2Xwkqqjq3HWVJxHLcNA5-qSApMmIjvQeA4v9s9X2EMuGV9BA_lWSWW-LRBwxuMEXD0mT0NI1fHW8Pz38nGvlW7fk4Um7uC7kF9E0vnaDgPogjO6nL9ywcklpIJHrh1OkP2XA",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/102077031938067877388\">Reunion Kitchen + Drink</a>",
              "photo_order": 1,
              "created_at": "2025-12-27T02:03:01.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/f317b0a4-8494-4212-8c5c-65fab1b59e4d/5.jpg",
              "id": "6d189075-bcd3-4ce6-8ff2-1217650876d3",
              "place_id": "f317b0a4-8494-4212-8c5c-65fab1b59e4d",
              "google_photo_reference": "AZLasHraigOJUHvteZCjdvReByz6LXM_hSoEPCTNgxID5PDOjXyd0gWXOFOMOCtOT8wqBw6ELe2e1gqTQioCE2IpTmu--AO_Sl5L0TNFESG4ObbbEaml1-bD5byICl_tAIxpXYwUaFH1pCqFNHBW7h5qdo5lLgTdKts1At-VGWz-kgCvSsKWm-Da68rj_FurLmxwJA6hBMblkl9IKCNEgb8xYF5F3jz0QC_3jZLzhMouDByFqfrcKe12RVWhLt6wwtjHCCyErW169NxT-3hiCj1x9b0JmUIrrub7z7eNWW_8czDt0rsTk1fRGV7S6M-zxx1isenHQM3lz7UE_F6Xx5XXZTUpIoq2NcqI7mU58iKvYNdxp1N4MLfBx8_Xp36HrDdBsogZIrkNi07toZngvng5qK04EzbMIT53COomR4JDeiOx1giEndx4o4Mnm3uzwSKr",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/117738250906370044426\">Daniel Olvera</a>",
              "photo_order": 5,
              "created_at": "2025-12-27T02:03:01.000Z",
              "deleted_at": null
            }
          ]
        }
      },
      {
        "id": "c2bf3912-57a6-4037-a597-964ad59e8cb2",
        "trip_id": "817e87ed-adee-4a16-9c91-de5b6d6b218a",
        "name": "Shanghai Disneyland Park",
        "address": null,
        "rating": null,
        "price_level": null,
        "types": null,
        "description": null,
        "display_order": 0,
        "place_id": "2b391869-fabc-45fd-99f8-41f4e2b21b69",
        "created_at": "2025-12-27T01:54:12.000Z",
        "deleted_at": null,
        "place": {
          "id": "2b391869-fabc-45fd-99f8-41f4e2b21b69",
          "google_place_id": "ChIJeTeSUGiHrTURrNSkfYkOFGo",
          "name": "Shanghai Disneyland Park",
          "address": "4MV5+945, Pudong, Shanghai, China, 201205",
          "city_id": null,
          "latitude": 31.1433969,
          "longitude": 121.6578713,
          "rating": "4.5",
          "user_ratings_total": 2896,
          "price_level": null,
          "types": [
            "amusement_park",
            "establishment",
            "point_of_interest"
          ],
          "phone_number": "400 180 0000",
          "website": "https://www.shanghaidisneyresort.com/",
          "opening_hours": [
            "Monday: 8:30 AM – 9:30 PM",
            "Tuesday: 8:30 AM – 9:30 PM",
            "Wednesday: 8:30 AM – 9:30 PM",
            "Thursday: 8:30 AM – 9:30 PM",
            "Friday: 8:30 AM – 9:30 PM",
            "Saturday: 8:30 AM – 9:30 PM",
            "Sunday: 8:30 AM – 9:30 PM"
          ],
          "visible": true,
          "created_at": "2025-12-27T02:16:19.000Z",
          "updated_at": "2025-12-27T02:16:19.000Z",
          "deleted_at": null,
          "photos": [
            {
              "url": null,
              "id": "14cf8d16-4931-4195-9743-30ec7c197ae3",
              "place_id": "2b391869-fabc-45fd-99f8-41f4e2b21b69",
              "google_photo_reference": "AZLasHrTnJEZXA15hSB2IRdL2yv1oVyI9_weGR98P9V6MSS0GMAcXI242EzLp6XcTMvxywtRAFOL9qhkSSswCWFSQgkYcje3qZvv5eOqlNeliVjAY6OJPr7qrDWD31d9lKvql0ZYICRhn6iE7sEvevPl32bSeuDQPHzXga9MrLcfElFPWtj9E6P4jkF8GqxTLmWGY4HIYf_N9VNbc_thvVmzY2R9gLt9b3xBvxRBnSbhCbjiwPUn5y9y8S8Ns8c4uJTEnpGwsX6quGRtWj9_Rdsrum4BcfP2McMhlIhIOiq9CQllNjUiGIlMMwrwJvK45F1n8rWpFignL152TmdhgLIsJDSSPz7pa8YP3adeS8udk3-LcrAKZ5myyqjNr6yr31YcPfXh_Ggpp02jSX3b-Oopjx8rCi8p6g48b1OG7g",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/116132421413516934595\">Nini</a>",
              "photo_order": 5,
              "created_at": "2025-12-27T02:16:19.000Z",
              "deleted_at": null
            },
            {
              "url": null,
              "id": "2edb3b1f-107b-49a4-a834-f8ea0c8ab0c9",
              "place_id": "2b391869-fabc-45fd-99f8-41f4e2b21b69",
              "google_photo_reference": "AZLasHp0VGM1X_1S4uSTpsjfmgwe2ZrLh82QAmtRObrBcIEPq859EEv-HPv6-HaroY3b-kUltlKS61hD5IzV2LHR0dGrf_HhZGIAGyRlaVkjUkfvYQd0F23KxmwVD3eAlwC4Vun7C8gxZKc0aJ2hKR80zT9LqFjVQkezSn2aTouDLT3lO1_JuI32_GJNugzG09N5k0JF6vfySiWB0e5ofkDPwUpE2ZIW6QvvXMJ9iBPD4cqZOMFBxKLiRTfVpr8SEoc4e0RefhruBDchGT7VJpq9sqvzVYmCMX1f6TsBSxPNWxtfYiEhpx4UHgpnbIoc4E-oOOJ05TPmMEx7g9FwR8Rl7qaJkztw4UyyX83HefuxP6PZvyqzzxBpbbk4h7BzlxMiEtzShOmFd_JOBMrpdWYi0TJZZv67f84HD-ejvSw1X4s",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/117854793167163870335\">Robert Mulyono Putra</a>",
              "photo_order": 2,
              "created_at": "2025-12-27T02:16:19.000Z",
              "deleted_at": null
            },
            {
              "url": null,
              "id": "52757d72-ec03-4c05-a9e1-251a032b2624",
              "place_id": "2b391869-fabc-45fd-99f8-41f4e2b21b69",
              "google_photo_reference": "AZLasHpEZeCwqNZ93Sj1L4h4RxR2WVTlF9cpaGsRwOhcJy0wWQZJuWfAql6myLUSnm-EjbiMyvo1vMBbUBbfld8c-emYC_w4wPlweYUfydfgI1qHQwp2lZNdSeGSrZal8QoukDxFiE-LrSiVRzogv1ye4Dq6LRpsHfIXHrgFwB-hiYkGYjljBup_oxt0l1Z4n-5HVYkJ9u7thSRFOWtlpLlOIvXYr-ngUumg2OpgszwhORlTxJnsOz6JrLCceiVGPsatmmzargawz-zAs5b_0wkycTMuMpExmZUUHCOm6p6bdSWPD5AER3A1IpAKSYOkmoBu5ukxipS9aWi9UkCHBvOMFRI16FPQFZDUIkp4G7Xr39zr648TPoy6Jzra9iT993xXDgGKQvBguuoFlgzhPwesJaqoY_p1jCXofMlOLSjkBOrWIQ",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/116172142251971190674\">Bernard</a>",
              "photo_order": 8,
              "created_at": "2025-12-27T02:16:19.000Z",
              "deleted_at": null
            },
            {
              "url": null,
              "id": "49e7187f-0681-4a9e-8c34-58fb6d1d3a13",
              "place_id": "2b391869-fabc-45fd-99f8-41f4e2b21b69",
              "google_photo_reference": "AZLasHpQobe08Mt5X75tw2DLN5oj7TM1EX2jN7gSlUXxxhMZJ5zdvPGNZRRUB0eFoUXxKrkXLcYYJcfu0vCSiFpdypZuJDM41NYJWEPpsFozdpDh_-uaH-Asy-c3v-Ns6A6VC2xfzgXq0_FNj7X_YsuF4AvB_NMnH6SPHh3LKEZXNv64R2bJoXp8ArWgl6NWBUa3tEKI2nMtVnmoouoQOuGPlEhGgfziruHNCSmGEA89IMHScEvfiTmMsDLHIC5UKOkES_FiBmYJT8xMV9vTtBD_kvnWw1_6UGjTI5V2iZfoqD7_tCNKCDNfFwIiewC0SSiIQvcGoi7k-l7FAYngfYxePb-15R7H6jzq3Q8QVqyX_CRUVuh4EOjyHaJU123bGmkQX3U4xWpJwxXoKK-_ECOOUEvYXBU7EPkCCAAOS4VfdrUz0Q",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/106728358970059464884\">Shiwen DD</a>",
              "photo_order": 6,
              "created_at": "2025-12-27T02:16:19.000Z",
              "deleted_at": null
            },
            {
              "url": null,
              "id": "afda4e8b-e944-4f0d-bcf6-8f07127895f5",
              "place_id": "2b391869-fabc-45fd-99f8-41f4e2b21b69",
              "google_photo_reference": "AZLasHrbK2KubmLM23OGLV6yOndvljSLo4qRTBtv4jZGyee8wweEWgkeJiMlvjPv1rafMlr0OqA3YzT9KY97ep1CCZOCn3fW957_JwVfePVaBmv1dIIoZm_TtBHE0gopjnXzrmPaXPaOsuGqN6VCyx3tK3MqqB0VxFQerpxjBjuJaDTqHuMLVFk-JtOZd1I2B95pQ-juPWvh0swMGyF8iT-8tBv2-Xcn1hB9enD7LkouRmAS0eSTpIfxHhlvdmAgVgFP3dhpip6Q_ktFiyZLnItIwMUP8aAJV5nYPLtGYkYcfSuE_ySoOseoPpzbXEn3x6Y3Yg9_L7dOOFzj1AwOg0Py0U5NHAnfIAwY_uqt_I_JRL7B4yT0oIgu26lcWVI8hOcdLAd-NoFL8_BCWTO-vGYYWo0iV2SR-Vz5A4igkxDumE579qw",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/108461324035928545703\">LEE</a>",
              "photo_order": 3,
              "created_at": "2025-12-27T02:16:19.000Z",
              "deleted_at": null
            },
            {
              "url": null,
              "id": "0e998bbf-a8df-4cea-bd96-3e3d1e9b1a6e",
              "place_id": "2b391869-fabc-45fd-99f8-41f4e2b21b69",
              "google_photo_reference": "AZLasHoS_lttaKm6qEvFJncAGg7nns1dnJlL83IMxF2nvj2TvnMXtSlwtp4B5R5osrrme6vt7jG2hBuXi67In_lJX7751e6kr1ADRP7AG4DIBhjhTL0GYM08Dd30pcrzMyTB5jixL4s-chuC6eYepiNuJSJ-RPjTrDG4cb1GY8BXZtiQZa8pySdGcSz2NTpGPmxVp2upY1_XL-yUKaVRCbvIKl55HHLdrSH_zbUqMSpFTOy1HvB-eAK13EwamYDQhteE8d653WMUAGYfWujOckWM5CGLmMGs7ltUDN_mH8puNn4kRV9CX9ikp4Het3-dqHtUElygIYT-nvlUIzF1Afmyi0oU4dW191JbCBF8intKTNtMUFDh3tqkUioq7i6k_UKNpGwGmCJAP8JyJnJ3LeBTyrv2Fcl5rhkSD-4-brElBALDSjaC",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/117330737665385891805\">HERBY STEVAN</a>",
              "photo_order": 0,
              "created_at": "2025-12-27T02:16:19.000Z",
              "deleted_at": null
            },
            {
              "url": null,
              "id": "b762a75b-741a-43e2-be5f-aa75c9bd3bc3",
              "place_id": "2b391869-fabc-45fd-99f8-41f4e2b21b69",
              "google_photo_reference": "AZLasHouS46l1JqqF9E7WCGRPxSx4Q6YIL0S_9kmjjrbSFI1wN3J1DdU8cnqQLvRRApCQbYvBfi--Gjph33IjJv98l7-zmm3tq_04DefqHzijoJbOMNHpgom8lr0FvK7dC_XPKUhAPAy31ttP4oMtHhmVMib_nywd8Phc_iraoX6bhXT0Nf8Ugplv48XS3OhuthL-C_EmUtlZUDBvUnTAl-mzo6G_HzSQ-1yDKUC_cRnk1gSH508wC0K4LKNheuYYY89L-_9NKeiFzLb0PygTfK0RKDqZxwwAL25IRqPrgIVqINOoVFOUFZ4vWoAZKhoSARQeYdmjLTGGA-l_U5YiwvoTmOPV6JSIPtLCOKeZw0B4df1llfapxoBVZHTjdEh0bWps8qexfxBaC1DgzOE_HZJ800fRTGKc10DRg28HuA4LbKHMg",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/116972011040804907975\">Roy Neoh</a>",
              "photo_order": 7,
              "created_at": "2025-12-27T02:16:19.000Z",
              "deleted_at": null
            },
            {
              "url": null,
              "id": "1df787ba-be58-4d0b-86be-30fcb9bb6b8a",
              "place_id": "2b391869-fabc-45fd-99f8-41f4e2b21b69",
              "google_photo_reference": "AZLasHoV-KDY5CMFISEZQDfJ5JOYnwxtWdjH13LP6jdITX62MWxT1i34YRsF8ytIG2cUTAL_d4mmCo2OT4Euuul9Iqd8tZB6kuL2QHZGzmxuqkXbuBGtphPxmZ3qvg5YMwStOrY8DseonAL6KUGi3X5HYt6lrEREnKxYV8u-Nwg55nKttCRZf7iVH3NFo2y_mSi3jU2U1FzHAO8_6tYlL3cu2ALp5CrdJeLIuh_0ZBIwmW0IzTZcgkwFY5BN6nKDQ6kgcT_dkjzhYszUwk0PNr7IC8MLMmb3gILs5JJWXvJFWs9WZ-52qHa8R2f5v3QCtG3yXaGeTlRZr-GXmUwPSl4sVpBBcvA_ij7xwNywIfbptTYm55r471JFHFvENRqGj66iOLtQ4sWwDuBNRKR9Mj5Aph_GpczkNdPu2Ig_xugAzyZwAfnz",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/102087586323504662512\">Greg Fournier</a>",
              "photo_order": 1,
              "created_at": "2025-12-27T02:16:19.000Z",
              "deleted_at": null
            },
            {
              "url": null,
              "id": "b32c7c89-84ee-4955-8c69-6013cf44a9a3",
              "place_id": "2b391869-fabc-45fd-99f8-41f4e2b21b69",
              "google_photo_reference": "AZLasHrLIJFn_RKNpH4wV4SmZmGxoKz4Ff0joallUmXx7-cyINspdNxvcdmSh7apz4yhA6_mcsymIqOmJ9aDClcAna_77vr7H-G4IcKPa_RI4mdAoi1Mxt2rnnV2emwtxHSZTa8Lo-O_YHlaO9eGhDr1GoNYVIcWtHLf8HO4ZCIcyqUjiV_qSb-R3s1-ItbAD5lxz5cyrwemaML6a0TtVPOy5rHuv-5ftv9XdcmXorvVIlRPMg_OCzeX4i_MU1coXeov-lfzxo1SLJxYzuZhAjYDlOOpVo7yaUpYjpKvNjZvCw81u7mtUKTHWpQO8ZFhHGTVBHmy0tcA3O6xRuAyuXxtBynAlARQpHCawz8xep07GnAKOSEBBQbwdc_Ux0W8JtsLG7HBPuOr3xFiU1om-GzM1_Eu0AYccfpcRYNik0jN5TcKpWsY7uBpml4DU80zdg",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/114350980605374400219\">Boey Zhan Yin</a>",
              "photo_order": 9,
              "created_at": "2025-12-27T02:16:19.000Z",
              "deleted_at": null
            },
            {
              "url": null,
              "id": "93683685-e6b9-4cef-a947-4dc8fcd1b4cc",
              "place_id": "2b391869-fabc-45fd-99f8-41f4e2b21b69",
              "google_photo_reference": "AZLasHoXOiohrERinTtCSpMjct1s1SG_98jWP56sDxFnPrU5YBKAHQyXpYhm3X7DIu4b_FryqY9ETtXBDqizF3lP77Y1xh3aTUn1FylMfTYK246bCUHnCgfrMwHL7N38FQXUx5c-gRXLx63aABRjb9AL_0pUEGHKszlZYCtEHbR_w-FjSevmPBBOG8Wx4jnw9tpxgyGj0ZTvr3cyqG_SbWMWM6nAvDYKGsQQdDdvQ6hY0SJOilvOmOETmUM27iObG69L0khezqlkYOh-xCQg_p2dS4HCdq0k7bTQdui9_3UwhoHX1YitnEqsAXpUIdpvLyjNtyO4ZjDcrUZrBrahiNC_J7rNxCHgIcP-n7OuyQZEvssMf1X3fKziZY73WmXk0Qz0qpG3okOSyWHZE1S2Lw9OhBXQF9I91-y5oUrkVI8BbWqMDw",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/102552734962804301031\">star2kiki</a>",
              "photo_order": 4,
              "created_at": "2025-12-27T02:16:19.000Z",
              "deleted_at": null
            }
          ]
        }
      },
      {
        "id": "d117a8f1-7bc4-4903-9413-64eb68cf6a04",
        "trip_id": "817e87ed-adee-4a16-9c91-de5b6d6b218a",
        "name": "Disneyland Park",
        "address": null,
        "rating": null,
        "price_level": null,
        "types": null,
        "description": null,
        "display_order": 0,
        "place_id": "b179f42f-e3d9-4cfa-a909-9f00eca0598d",
        "created_at": "2025-12-27T01:46:56.000Z",
        "deleted_at": null,
        "place": {
          "id": "b179f42f-e3d9-4cfa-a909-9f00eca0598d",
          "google_place_id": "ChIJa147K9HX3IAR-lwiGIQv9i4",
          "name": "Disneyland Park",
          "address": "Anaheim, CA 92802, USA",
          "city_id": null,
          "latitude": null,
          "longitude": null,
          "rating": "4.6",
          "user_ratings_total": null,
          "price_level": null,
          "types": [
            "amusement_park",
            "establishment",
            "point_of_interest",
            "tourist_attraction"
          ],
          "phone_number": null,
          "website": null,
          "opening_hours": null,
          "visible": true,
          "created_at": "2025-12-27T01:46:48.000Z",
          "updated_at": "2025-12-27T01:46:48.000Z",
          "deleted_at": null,
          "photos": [
            {
              "url": "http://localhost:3000/images/places/b179f42f-e3d9-4cfa-a909-9f00eca0598d/2.jpg",
              "id": "0f6e104b-16ef-400b-8b5d-0182afd76fef",
              "place_id": "b179f42f-e3d9-4cfa-a909-9f00eca0598d",
              "google_photo_reference": "AZLasHp0N2MKwN_1UvTu0dTNL79NPeh3FRWNBWh4vBRvJgl4yd63OVQtnJEvX8G7nk9KM_zXLwnVv-o4yhk5l6m_SSmuVyfe-BwfGKvMQ_LectYqUE5WOyKjMmWInj98T8aWdwoitMU-ZNyA7nDk9k1ZnxCaUReboyjnkJoIzmaZVm5QlTYEJ6J-u5YTjEtAoBPuWWXYshz8gooV9sRuKPt67_oT-jrOtRd_D_YUiM0zoM0a6-P5Ozgvsr_8f42PY56H3YuFbVkCzdGNxWMgqE-quPyOMK0UWKHnn9YFThbKoRveFsKheFoxj-UX1FJRdh5Q8OfVrcf5ogfc1UtxmO2lo9JT5Y33QyaZoACTYEHTGyoEUaU4Uxzmli1Xd-82MPJIUXgN8ZyI9tk8xWU7RSRyVaf_IJEWsMDK5GvEIkzdBpP66nVf",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/117093479454369538257\">Salendra Patel</a>",
              "photo_order": 2,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/b179f42f-e3d9-4cfa-a909-9f00eca0598d/1.jpg",
              "id": "e4e82ba6-020f-4b2c-9e7d-4e9a2a329dd5",
              "place_id": "b179f42f-e3d9-4cfa-a909-9f00eca0598d",
              "google_photo_reference": "AZLasHpdyZXknh1JtkYcrPenyNTix_hsJU30txmeYTo2gbSpce3KGrpVExQa7sg1GLNn-M4FK2_NoKL3XEAODMst_4CAMfH2lPwczpBKcEf7TVtEbBTUjK62Z6woEZ_wkPTJA5xlpBoqxWJwRsPijPHNDlk_PBiZr8LAnTghbVkAINmFf8rqZB6GtlQOMEiNiAH64Dp8cQDqT-VdfYmgxjg-bfNa5o2iwv2ZiuKjpxLRO0BC13kr6EeZjQWmyyT2bkv0Z5SYmqDAyIDDw8HvTlO9EPDBcTp2r7cqrgtiMkGLAj3K7xjV3KIkh6bhBp3Px7nteNqI8tDVzwu8sRqkpcZwsHCZ9tgeiz_8rXS2jYYDQItEYCPE5s0khDRLyB4QYskpTyAuqp_z9AcryEdOaSmLvTRPX0bcgAjBHAkoxvl94-w",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/107133076654191438290\">Corey Jacobson</a>",
              "photo_order": 1,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/b179f42f-e3d9-4cfa-a909-9f00eca0598d/7.jpg",
              "id": "c10369ac-6515-491a-b3b0-761b30b294e4",
              "place_id": "b179f42f-e3d9-4cfa-a909-9f00eca0598d",
              "google_photo_reference": "AZLasHpOtHjtxJiIqMYYddh4XKUDPr6AaDIuy80StQdAaRC42a2e8FiRNPoVrahBVTfiSNDCC2Pi-EKFF8WYL8O8uLYASoj0YNgNmb3wz6zq5t-tWlgVXCtDn2JnPRj1vPQ-mRp9lE9t0uwCTMkKpgmGTl4U47tL4tzm484S3OFw2wH95KR0zBQoBKzBlmLAU_3nc0y29EYp5W_cnIIl6Yv657bp51eZzX66njomP_pidCHk7P9fTJnH6yZE3ctKbF4Xrsh-MXGZPwoQWzY1E4yDLmQ_oJR-m6W4FQuc_N-farBo3GedsRcHPRwLyokiBVmOO0sy2FAdbeTLcJrE1pM_hl0qe-yRP-l-oQkNss003vg5B102ODH_8wFmXE5tu6FiDiVMxHFgBjxLvvRg1laoRZQvSYnP7Vk-ukLrIckWV1n3cG8g",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/111643554349105053480\">Lea M</a>",
              "photo_order": 7,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/b179f42f-e3d9-4cfa-a909-9f00eca0598d/3.jpg",
              "id": "c4d4e572-727e-4d81-b392-648577b7bb97",
              "place_id": "b179f42f-e3d9-4cfa-a909-9f00eca0598d",
              "google_photo_reference": "AZLasHqmauhTK88y840j_Zrnl1oRrmE0qaJ8hHEao_t9KhMpgsBAwUtVf6FIqg_p-KIHlU2OWoIQpek0ikGI-cfldL_RZrybUu1TPHrrBVQfRvvsoBruSP2Ygw35N2O8g4taTywwI4JulqsIVD1YbPkyj1c57DF4POnSGw490iDiMmDV39Sn-H8j_Lv2__mlfIM9enIIelya1yioKOF5M43Oov5-ukcPl8yWO8VyrAJqrKEouN1_H2IZsfgx_WGa0-xy_TQXjRbM_SeaSe7Xa8cQ15zO85LgdnJZ04yiKnbUiB2FU7vgT1DGj3w-IVhn8fwxeu-pqgVbRM9M6PgOPuTG17q-kdkyk_Oywq8zsmE1REJZi1Xj_lRlQPda7jkbPnyw8lvacHQdtXPCwRV7ABmTvy-IPcwl3mLeYhyiyrSVMazzdQ",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/108860715494297843582\">Matthew Messenger</a>",
              "photo_order": 3,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/b179f42f-e3d9-4cfa-a909-9f00eca0598d/0.jpg",
              "id": "552c8507-e27b-40eb-a6b5-5c259579d94e",
              "place_id": "b179f42f-e3d9-4cfa-a909-9f00eca0598d",
              "google_photo_reference": "AZLasHr-SXQvGDaN-PNPV_v-W4NgInb3Vxs7_OJFZVszR3COs7K57DzR-674dRpccwOB8tSV9GNOS198n9WpsxmAGNHdHtCkVV5eP-2kOyOr6pgRbCOPgPnMJbOEB27zSe3SXY0LkdRZS3JZ5u2MOPMZHCWu7132e06_xGXaiupJ9esZS-jQWpR8zDw4agv8mmE6wPn22qLJX3wUKxKYX9rzOnaiNYLJbj0x3eOWPw42DcVn9MJnkIf2lrMUcMmQjcCZFegAwBsoI6h21_ouN2dJh1fsdP1q9q0uvZ0HFOh2pTplPKu88Zp3jm4FaYFyF336NkuATk9PGZ23IFUPOAXZrwZWeID9DAmtnjf5XgxVjHrn09brmMue7oQk4_ELOtRO5eNFombloCCecS5WivGjiqiNc_f5HSa9vgtmcAW56Zjbgg",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/113247411782524887297\">مختار الجلال</a>",
              "photo_order": 0,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/b179f42f-e3d9-4cfa-a909-9f00eca0598d/8.jpg",
              "id": "40cf8fd3-cbca-48fe-9744-118c99f1d02a",
              "place_id": "b179f42f-e3d9-4cfa-a909-9f00eca0598d",
              "google_photo_reference": "AZLasHrBpxRwgYduUdzujhQl1vHmhMaKJgRBsjmGzrv9I7G6eCEOLvEYTyiT995fDDjfs98P-vBZhCObS6z07z3qqX_ecKOvD5ubbhdH_SAxvokw0EbiocII2QmDshiHJQA4zTae4llalcS8OSECb-ehriW-cTVQvZDSTFUHWP1Hx6qyqWpZ5erUFiO4DSEZe_mRh-ctlmRwwWJJ03dRhTaDe6oJYCUllN4YWexJnv5jRNOPti4baxwxonb2SsyJQtL4jcSrkJINQn2YlzjCjbWAYX6e5U-YiuXlcEONAd53Ad7SjnnXrRIVWO6JNHcaFt2T6VpJfB9AZnl8shRHuAbEAsi0s0T4uKdWtKIAReLEZx-ByjN9Mm_QpIkwiR-e72p9xZmaQ5RFudIh3ehmBHIzMkcH0Y_DHKPkZwhFz4v58dPtFw",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/117093479454369538257\">Salendra Patel</a>",
              "photo_order": 8,
              "created_at": "2025-12-27T01:46:51.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/b179f42f-e3d9-4cfa-a909-9f00eca0598d/6.jpg",
              "id": "70ff2366-26e8-4981-bedd-eefbb0ed86ec",
              "place_id": "b179f42f-e3d9-4cfa-a909-9f00eca0598d",
              "google_photo_reference": "AZLasHrH9LPa1SJgvu6H9UJv4ySc0cuFrCs_L67qQG8YuJOFZMHHCJzO8Ynd-wMZhgyPkiVxF1l_pWt1gAWdPa0sQrdiPH6VxLGdYcuaWCPmC6iEbuUv__8MkALELhqbqpW60g7HQe-dhwTOnEzpgGMQ1v6Zv5rCGUgSqGyJbAgq4KfyxV_FzPzO4BsWmxsLDXn9R2GCliDBc6zmliaD3brcnw5JN7MRGcpwY1HV9kVPfRsFSxI7_QlQWPLbr5KHUYO03QYXSXwfeN1k3-bCfMediLhafUuj0pG6qEbp07mn9l1g3gK-iCJjheL1pOxOAbiziilTHiz24qiGcT4RT5VABYccyqorDPk0a0M7O79oIwa9IGjlEswsKBBPVmVyHMGJ1BDpBRbQrBI-EE8_l-6t8ffk6QFnCN66yrCflK1CnHIv3Fbd",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/103070225099052045911\">Rob</a>",
              "photo_order": 6,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/b179f42f-e3d9-4cfa-a909-9f00eca0598d/4.jpg",
              "id": "c7bac8e8-c73c-4c52-ac9a-202ce406ca1d",
              "place_id": "b179f42f-e3d9-4cfa-a909-9f00eca0598d",
              "google_photo_reference": "AZLasHrhRGi2YoRAGsDDUXzTgixg5-JC5nf_OdJG1yj9IgTO5f5IKSQsZ-Y71TN5cUryVac8-xJgpE8qWN4dbfpo2GM7ubOMjVyhh6jI4-YHri7pt7pFvtDruo1et9XMZt0EQGHr0DNlqPCy465PZ7L9wrr3Hm-_aqGrn-2qBP5lxBhwtVV02KYKrK2WZg5Ffs2XOwcyiCMLn19Jayar1QWWpEWdFNJU-bdxD_fdWjvHPJOK28rzaSR-l6TQw4YAIc-vkN1mxy2ENZc9z93qNq5QLn2xxYaH5AMJ128d-wiKSZZ75W2qqUvUKgGJcJPNyCNbt5QMVeshclkpQwcGXfBs8j7QKBS1Z1dgdmN-tPYRSkuua5GHDFBhHefNkBoHsOcOlKskcHDbNHwB46-4ddNAMsfHNzxHhNfYrJyajewSFGhFRpN4",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/101680198979984561832\">Greg Moto</a>",
              "photo_order": 4,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/b179f42f-e3d9-4cfa-a909-9f00eca0598d/5.jpg",
              "id": "60b68d84-6a9d-4729-bf34-81609a0ab810",
              "place_id": "b179f42f-e3d9-4cfa-a909-9f00eca0598d",
              "google_photo_reference": "AZLasHrNry7uXWF1o7xeBlqLBOfgcJjJZkN3co131eSMUARFjEIPbot3WCEewoVLnOMOCikPP85NKOrdk66HZ3gu5T8WZ8GEae7TBSJeZ6Ja49xujdwJxRyVz1qzm_QFxzX5FF4Rv8X-RDP5VH7jWB1QOyqK6FYljfnxDq4EOTpYORFsJv1FMNVg9XgX0dG--4V-__AnjoXn7dIrwh2InauecrQb76mT4qm-yXTHQWQ5QeqQ5upMaexBLoVK71W2gIB2ruKhJz8OGBadrLi9JE0J3_GNjPRg7r3JlSWo-THrDUwfUTssfWLu374bcKWXEuv6sp_cCNPqQSUv7mB9jfYRCVeXDuvcxbe3_DzmLdDb22D-wFos6kxBqm5V-3X0h5i4ZhkH4jrDDL1UsegdtLOs0GjqIwxWru-9nNykfNjp1aHczQ",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/108290395910305411939\">William L Jones Jr</a>",
              "photo_order": 5,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/b179f42f-e3d9-4cfa-a909-9f00eca0598d/9.jpg",
              "id": "f17b71d0-557c-4d13-8f0a-af6e8911e26d",
              "place_id": "b179f42f-e3d9-4cfa-a909-9f00eca0598d",
              "google_photo_reference": "AZLasHqlfIbNDJsjZrp2Dv3cTSZVB2MrSeikV0WEnjs3Ykf1xQGJsOU4NIO8HnBjsTRB1hnW0c7ivzcrP28c8ANbAczpkZoFoG1nBHQd_YSmyDAoOa-8bZsXYO6kuMQifm599Cs9pZpOBhYlNTC3su0Fq-qZhgKRgA5nyfcqLb4YFNRKD_cn_wzP3Vfd9fpA-V-DRsWvpJiIFUtAuJXlJ4ksIZdRc7oewcnBugf-wuEP2yEbqvQD1yb21PjrxS6DSnuK2oUS5Vh3hn_8Q23v9EFqvamjvo9no0gnA9-lV46G7V1wuQXun1glsSShSqUm8HCV0urWukJyPB79AGzXbvUVD32lzyraP44GVPVGi4ZhIG9oKIsn1m8BPU40fYykRUWRhZjosxkRNkjxjTV8ZDP5zdmxXY6IV7AkWmR2_aTMhnhgnLY",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/113326929119043422833\">John robin singh</a>",
              "photo_order": 9,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            }
          ]
        }
      },
      {
        "id": "f772ef59-1cd7-4e6e-a3be-5016df7b4072",
        "trip_id": "817e87ed-adee-4a16-9c91-de5b6d6b218a",
        "name": "Magic Kingdom Park",
        "address": null,
        "rating": null,
        "price_level": null,
        "types": null,
        "description": null,
        "display_order": 0,
        "place_id": "d7491bb9-56af-4f7c-91e6-c0ab56d86ed8",
        "created_at": "2025-12-27T01:52:45.000Z",
        "deleted_at": null,
        "place": {
          "id": "d7491bb9-56af-4f7c-91e6-c0ab56d86ed8",
          "google_place_id": "ChIJgUulalN-3YgRGoTaWM2LawY",
          "name": "Magic Kingdom Park",
          "address": "Bay Lake, FL 32836, USA",
          "city_id": null,
          "latitude": null,
          "longitude": null,
          "rating": "4.6",
          "user_ratings_total": null,
          "price_level": null,
          "types": [
            "amusement_park",
            "establishment",
            "point_of_interest",
            "tourist_attraction"
          ],
          "phone_number": null,
          "website": null,
          "opening_hours": null,
          "visible": true,
          "created_at": "2025-12-27T01:46:49.000Z",
          "updated_at": "2025-12-27T01:46:49.000Z",
          "deleted_at": null,
          "photos": [
            {
              "url": "http://localhost:3000/images/places/d7491bb9-56af-4f7c-91e6-c0ab56d86ed8/8.jpg",
              "id": "49ea7a5c-296b-48f9-a576-be3178c1fbeb",
              "place_id": "d7491bb9-56af-4f7c-91e6-c0ab56d86ed8",
              "google_photo_reference": "AZLasHr1QdYV9B5-r4zE-zdRjbYse5OAt9MiHT76Q5CPm7bQ6VUBGRUgY5qtuUdrHbE1lD9th_WEl2YDPvRUaaaHUXCI_hSu2-xl2K1RlIQdL8RK2-ihdJrv_xoh70TIsbZj-wMqfO-vMG2dsJRHi9LqoqXVhl1ZiUhLG_OirulkldSonrTmrgmgf9KQ-ArgjfFvGm2H2ckIUC3Y032hDMjVgfUnuVuPnF4du-4DvNG_kZT3pmpg17iB0T3NGoYa2puihdEGTbpERaJp4oQ8aC6RmLypx0f2dvmghDi62k1QWsoIbsTxokSStR7UPP7DCxA0QLWTRa4FgeyCGOmolwvAR1_ZkLEdTtkwSHdByuqASjIMOFuQO2CUOqiqtPI5LKSRD0o0efTARg1uaKDX_PdU60RwJuV-RIR7Ib1RbUuVP3c",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/106338107742737938502\">Thiago Ruaro</a>",
              "photo_order": 8,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/d7491bb9-56af-4f7c-91e6-c0ab56d86ed8/5.jpg",
              "id": "19967420-1e8b-4ccf-bb68-b1a706a17bb0",
              "place_id": "d7491bb9-56af-4f7c-91e6-c0ab56d86ed8",
              "google_photo_reference": "AZLasHrcOe4XJkI_xGLbTi25K6K5PKXm5zyCjppfaHVh592V_ABh6kzQG_gluFIDJ_AOSm-kpVWgUDQePgUsA4rGQG7fLbW_0QaO3RSrDSM5eYE0hfRd0sx-gXZEEcIseXJAZZErWNCP2Go47G1vXe_wGC9--IcyKJttJ4vVCKZ1nILNB6ozLBF46XABh4r5JVBHrE9XXxU-v7jTTKDL3IRm0oIMn7ucxS9mbER0HNwQor42V5X5-xV7_2iw0fx5r-0M7QRh1YE_ww0SaH_8S7LTQXgTJfDnxFQW7-dsKyScyc6aabGai4jm3qG0-kHouRtWVCMdRvkbiMpS-u1_EjLlygD3rtyojtiiG7RsEfYXRQi7tm2SxrmHnZ-jmX_HA2bIowHLVsJtRLnzLmoS_zGLmiUecYNIG-SR9XeZj0EwV-EbcQ",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/108659606448409266802\">Eddie Moore</a>",
              "photo_order": 5,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/d7491bb9-56af-4f7c-91e6-c0ab56d86ed8/2.jpg",
              "id": "68a28898-b8c9-4b8b-97ed-efdc71912655",
              "place_id": "d7491bb9-56af-4f7c-91e6-c0ab56d86ed8",
              "google_photo_reference": "AZLasHoqRlXjaNG7bSUlXed7oLt_zCWvkGHUqkKL6sodOH0gW1iCna68-SJCCnoX0cAcSoDOUKXSp3yDIiicm3XKupZHBUU9fKoVaK4-HyTjnCQZhzvEczuZTl6ErvV2yz3JEchKSy9lBzfgH0jqJGv1i1f8AZydKtNHyzLCw693WVi1-M3XFmsgjiRtTAmYEjkBuSQRQFn_J196UF5o1kwxTDZgJAbHd3JuQgdSlTVFr7feLpzm6k3PdO8zSpJxJXhJSljMLOPW1PX0Jp4kxU-Hrfnf_ce7pJEX-xs879C8ChThTdCfnRSPgETm_oJfMSjIh40RDWpR3bZtakQqa6DKZChOTpM4W2jgylquqN9tuxNNII5X-QbPTZ_zbZkt5E6viDm5h502zZb7hu3Y9HLNdnwesqJqllWNnNDHuaLl4IICIA",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/116811206971456147516\">Khalil ibrahim</a>",
              "photo_order": 2,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/d7491bb9-56af-4f7c-91e6-c0ab56d86ed8/1.jpg",
              "id": "01c51303-44ee-44b2-abe3-ce90f7af6fcc",
              "place_id": "d7491bb9-56af-4f7c-91e6-c0ab56d86ed8",
              "google_photo_reference": "AZLasHpCiNicKqsO8cOGRFCC3-ldFH7-WNWUa3k0cJGSppu4mg2tg1LCI35yCnR1g-FqvsZTbg37AlfuzMFlWvDLBOAtg1fDiMndrWZ40mpiorgs0G3uXzyYIZKE2rgL1OKXS206z-Cs6017sg0J6rZRI_iRhle-wEejAUleQOtjr-ZAhjdhgtoFPYBuRSM6hzEIFfVqfQWLV2GwN0BC2uR4pTDtbNx6hrS6sbkg1vCeRRm1Hx_pxxM-25v3m9B8hiIW_2t2EkJtiIR9cJsO4kx-zefifFd42-sa1t-OI2Py4V_V4BNW94yc9o1BUI5i2294IoYqbCHaPvAnSnmLhrvZG09x4v6xGNkg6ob_ihup6UmZ2MxaPNeYXEbRHOniIczHlPSgrPhAV6rAFaIwTi3AR2iFq4tW3kj4J6RV52TSUnL27Usp",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/110659939212407365787\">Pete P. Journey</a>",
              "photo_order": 1,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/d7491bb9-56af-4f7c-91e6-c0ab56d86ed8/4.jpg",
              "id": "76ed3fba-4a65-4735-9039-b947375f0b3c",
              "place_id": "d7491bb9-56af-4f7c-91e6-c0ab56d86ed8",
              "google_photo_reference": "AZLasHpPjnti-eirAG7ELWkYIipguQmrT8_9SOLiiOj6E2Pvgg_mJ8sJVM_LM9BMhAYG3O58unBTvZiDBP4xhZTHWCjsU3LuPmMVqjdUbNLRTphVCf0HCMQP_y5j0i7Q-_UC_h-9e7ZiL_IHeoeviRsdqqpwHj79XN3il1nRb82GOzxqT7ydqOm1X_HeLC_g0hAmi-No-6_nhp2MizBbJG8CcGuOGUGPRzal_Df45Cj6075oGIoTzPbuFaXciKaV-rTrLqSLiUWXeqclu5Bp3YLehRGuGO5xUTFtPCpwzh3jlpjeqbXFji27FQyxLc5H7fnsCXPEs1oCuj48oIZ-Yl5YSSQyaU951_hyyzB2urzytlFTLyTx_zNzkH7jm7kf-RBWXeAlf-THk4bFHrzQrJZtusbv0Hfu9gplu_F1rawjXM-ktcRr",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/104390779438639966685\">Harm Anneveldt</a>",
              "photo_order": 4,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/d7491bb9-56af-4f7c-91e6-c0ab56d86ed8/0.jpg",
              "id": "2b55501b-eb47-4bb1-a5c0-fe3522a84145",
              "place_id": "d7491bb9-56af-4f7c-91e6-c0ab56d86ed8",
              "google_photo_reference": "AZLasHqj8WBPMRjQovLcm0JnTvb_sQyeQDDOQrkPz_kHAGIE6XZpD5UHN9uWdL46ANFjpxZaztIOSuy3phD6l_CA4dG_Jr-aiW3kNdZMU2iFkCfhangy0MiI2FffkHmESC8Ybz7Pz9TmRI0e3c-hsmc3zh_YyP0-Ilx86_nnpTukJAVZK1weDiVOMzladW7k-6NTqp9usmf21rvPH0QvkW2oJL4aDQgnNxf9hzrLWGnlvKkWgNKDkJSePjwTtoltZZGq3kJEQ92uCZY7jzLD5GqobghDge8aIB7bQaeFTqWbSgu5hoVJDEx4htbb3EyRYsFGdTwC3Ty9G3ONfcl9T3r971B5UyRKot28TQEYBqoUZuyGVFMJ2SA4b491tiIegP0nWHOGjI7palKrdIqMGMckV9WQpEnZx_UCboA7OujuBpaNNB5bbjiZ1y-P4_0UxpA1",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/117861090342151423283\">David Blackburn</a>",
              "photo_order": 0,
              "created_at": "2025-12-27T01:46:49.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/d7491bb9-56af-4f7c-91e6-c0ab56d86ed8/3.jpg",
              "id": "8ae4852d-73e0-409d-b08a-d36b176988c2",
              "place_id": "d7491bb9-56af-4f7c-91e6-c0ab56d86ed8",
              "google_photo_reference": "AZLasHoAXEZpo7XJ4EC4a6jHiUBPJ7gSEC2IQn4XcwI-J_3pdyej6jOHut9GPcNzLM_IByawwek-rf2gNR-wUPGr40fiiJa4WdzuV3_5phL33njFgzbQCXA6LpqU-1lEQFvh7C8ZLDRv78ccik9XSkQUygc1rDlJ7IbC-fYjNBPqsOPpBafZgK77BjpZgL6STW2PZspeDje5nv8M8ri-1snv0OlvaQGvrxwCO77AWeIzAGbxV4aiMjN-uVUwOOrsHpaHN_sE9H_uZSUe1BpVm_UYsUHron2F_VWsGmCT428Qe3Iyh6yPVKtd2iE4NORw_X6wgZRb-wYRmbKME7B_ZBCXfA9Tde8L0ijarqGi9aqmdoNuH7mOuSE3NNhmb7BRbWBxx7ymz6CudazdDFQyDBbonAILHuTcew6Qrx9x3cpVLQ",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/103008710854488196421\">Abdul Peña Berlioz</a>",
              "photo_order": 3,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/d7491bb9-56af-4f7c-91e6-c0ab56d86ed8/9.jpg",
              "id": "df69bb2f-9e63-4d43-8868-1e118567e257",
              "place_id": "d7491bb9-56af-4f7c-91e6-c0ab56d86ed8",
              "google_photo_reference": "AZLasHqPFvBDpVa8XYLlAn2OTZ_y6qvG4zFdBMzHU4WtgNpwsjRnMdTzsS9MrrX_fxvbgJr7EKgYX8_q8JjeMR4yReLYZon38DdqL06mI62xbl0PRKudnCBeBNHuH1FGBzUNRyRlAQgDfp0T4hEiKlfxRgdC9cZgfqvoduzgdDg_XN4Hf55j1-dzncDALdV2KzpnuumAfSh-D5ZEBlAJD3jqM6W0z758MCVJN6gZQmylCj8UoOm-AktFtNqkkYJnF5NrUe2tfaNqWCDaV_XqYh7no5qXBkQXj6j98PBaoML-qFfJZKcsppOmAe5EUZ_MlI6CteIlhfQXQTB6Pi6xZOFUxga4Z0YrZm23OBXLfDsbgQLKVM1NeRVJ7QdkkgBMvI3vxnmDNLiH7mJJ5jOE5t5hZl2GHkCfY_uxWvl5kSi1yUwIhuM",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/117828022743189417040\">Gene Simco</a>",
              "photo_order": 9,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/d7491bb9-56af-4f7c-91e6-c0ab56d86ed8/7.jpg",
              "id": "280bf456-e78f-43b2-b6c5-9ef0ac3ed625",
              "place_id": "d7491bb9-56af-4f7c-91e6-c0ab56d86ed8",
              "google_photo_reference": "AZLasHqyzqb5FwNQAjVFvDbQsz6mQ4cJN78dRPIvRvjndYS6DgDUbI8WrhJSmlY-RjNyzVXNEG6dFOmbT2x347qt9aRmaFkgCBu2_l4jF8kpgvHzQSN8xQ8SHi3C9PkdgCUTuX3asWV62f8TU_67UaG1HH6bLKKHiIJnMNjxAp5xc3NgmBvvzA7HGO_FBXfbxn1wA0cbj1CkbL28e-I_ftgetvIETAkM1rbBTBAMkkMApu6drFi4JPywaJn_SkEyxe9GPZiYzjOcwTRpj0u0LiftVZ97t1S0l5eKTex1y7e016xxvMMyJCu1Zb1GEOUuQcIAVrKd9zGkbbg9WH5rHxkjm9cVRoatJj2TJxS_eUo7xiQx07MQJ1n5hItXQbP8p_nYn0-nn7Osb6zT-ab9s8lnT6qft8LQ2_iWBsYidMt4popkAEpc",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/106629067552762884267\">Fernando Rodriguez</a>",
              "photo_order": 7,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            },
            {
              "url": "http://localhost:3000/images/places/d7491bb9-56af-4f7c-91e6-c0ab56d86ed8/6.jpg",
              "id": "3efac65c-647a-49a3-91de-80c8040cfb11",
              "place_id": "d7491bb9-56af-4f7c-91e6-c0ab56d86ed8",
              "google_photo_reference": "AZLasHoPf3n5d71LzWM7CcUnKrWWN9omBAyBP4_BT6zKB-tawJrA0MUSflhgAXZBx7WleGxz3C94YN6pMX95ArRwlGkKNLmPgjTNPx7nZlP4YvVxphXshZ3xLu60Iav-Bfqieg9yI6z6XnuZ9igeJ4gieYeFUwO2GBxoT3yufdw_Vgo9B0AwXtQV8fkqFVH4qqQKEs-7E1L_5f2SAkad-Vpb3DXqcqxXjfamGNPJVQYv95fG9fnAkVQrnImrT_mCmXBdtCrG31r7ZQ2yKr5ZAq2xjHm7PRr9pvje1zxLx0z_fHH4eEFZLodnyaSt24X0w6vkGvNEdXDvdjv53zqiafbHAF07TueWf6SDHoD4HiY9ftHqMKQqA9a7GRH2Zxd6ZKYOHky67jR18QGw0f8upGJxclWnHQSPa48xfYxw4KvQsyqNM74X",
              "attribution": "<a href=\"https://maps.google.com/maps/contrib/100580410445757292671\">Tara Ferguson</a>",
              "photo_order": 6,
              "created_at": "2025-12-27T01:46:50.000Z",
              "deleted_at": null
            }
          ]
        }
      }
    ],
    "itineraryDays": [
      {
        "id": "8697df1e-475d-42fd-9349-841466252ff3",
        "trip_id": "817e87ed-adee-4a16-9c91-de5b6d6b218a",
        "city_id": null,
        "day_number": 3,
        "title": "Disney IN SHANGHI",
        "description": null,
        "created_at": "2025-12-27T14:09:31.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "afb5464e-e0fc-49f8-a878-52c91a9f1503",
            "itinerary_day_id": "8697df1e-475d-42fd-9349-841466252ff3",
            "time": "",
            "name": "Shanghai Disneyland Park",
            "location": "4MV5+945, Pudong, Shanghai, China, 201205",
            "description": "",
            "activity_order": 0,
            "place_id": "2b391869-fabc-45fd-99f8-41f4e2b21b69",
            "created_at": "2025-12-27T14:09:31.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "56a1cb18-d90b-4729-aee2-36ffdd01a73a",
        "trip_id": "817e87ed-adee-4a16-9c91-de5b6d6b218a",
        "city_id": null,
        "day_number": 1,
        "title": "Disney IN USA",
        "description": null,
        "created_at": "2025-12-27T14:09:31.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "4b26fa60-42c7-48c2-acd8-d33ef5f922e4",
            "itinerary_day_id": "56a1cb18-d90b-4729-aee2-36ffdd01a73a",
            "time": "11:00",
            "name": "Plaza Avenida Shopping",
            "location": "Av. José Munia, 4775 - Jardim Redentor, São José do Rio Preto - SP, 15085-350, Brazil",
            "description": "Paa",
            "activity_order": 1,
            "place_id": "09296c78-4b8b-40f8-975d-227a0ab7b433",
            "created_at": "2025-12-27T14:09:31.000Z",
            "deleted_at": null
          },
          {
            "id": "5d811e8e-20a5-45cb-a6a6-97faee8c1524",
            "itinerary_day_id": "56a1cb18-d90b-4729-aee2-36ffdd01a73a",
            "time": "07:00",
            "name": "Magic Kingdom Park",
            "location": "Bay Lake, FL 32836, USA",
            "description": "",
            "activity_order": 0,
            "place_id": "d7491bb9-56af-4f7c-91e6-c0ab56d86ed8",
            "created_at": "2025-12-27T14:09:31.000Z",
            "deleted_at": null
          }
        ]
      },
      {
        "id": "d21d3e49-d950-4f50-960e-64a0d394f2aa",
        "trip_id": "817e87ed-adee-4a16-9c91-de5b6d6b218a",
        "city_id": null,
        "day_number": 2,
        "title": "Disney IN JAPAN",
        "description": null,
        "created_at": "2025-12-27T14:09:31.000Z",
        "deleted_at": null,
        "activities": [
          {
            "id": "0f8ae069-53a2-49ae-91ee-71e390e06054",
            "itinerary_day_id": "d21d3e49-d950-4f50-960e-64a0d394f2aa",
            "time": "",
            "name": "Tokyo Disneyland",
            "location": "1-1 Maihama, Urayasu, Chiba 279-0031, Japan",
            "description": "",
            "activity_order": 0,
            "place_id": "a2192b69-cb69-48f4-9883-676df63bb417",
            "created_at": "2025-12-27T14:09:31.000Z",
            "deleted_at": null
          }
        ]
      }
    ],
    "images": [
      {
        "id": "a710c962-a599-42d7-811b-441625bff200",
        "trip_id": "817e87ed-adee-4a16-9c91-de5b6d6b218a",
        "place_photo_id": "8ae4852d-73e0-409d-b08a-d36b176988c2",
        "city_photo_id": null,
        "image_order": 2,
        "created_at": "2025-12-27T14:09:31.000Z",
        "deleted_at": null,
        "placePhoto": {
          "url": "http://localhost:3000/images/places/d7491bb9-56af-4f7c-91e6-c0ab56d86ed8/3.jpg",
          "id": "8ae4852d-73e0-409d-b08a-d36b176988c2",
          "place_id": "d7491bb9-56af-4f7c-91e6-c0ab56d86ed8",
          "google_photo_reference": "AZLasHoAXEZpo7XJ4EC4a6jHiUBPJ7gSEC2IQn4XcwI-J_3pdyej6jOHut9GPcNzLM_IByawwek-rf2gNR-wUPGr40fiiJa4WdzuV3_5phL33njFgzbQCXA6LpqU-1lEQFvh7C8ZLDRv78ccik9XSkQUygc1rDlJ7IbC-fYjNBPqsOPpBafZgK77BjpZgL6STW2PZspeDje5nv8M8ri-1snv0OlvaQGvrxwCO77AWeIzAGbxV4aiMjN-uVUwOOrsHpaHN_sE9H_uZSUe1BpVm_UYsUHron2F_VWsGmCT428Qe3Iyh6yPVKtd2iE4NORw_X6wgZRb-wYRmbKME7B_ZBCXfA9Tde8L0ijarqGi9aqmdoNuH7mOuSE3NNhmb7BRbWBxx7ymz6CudazdDFQyDBbonAILHuTcew6Qrx9x3cpVLQ",
          "attribution": "<a href=\"https://maps.google.com/maps/contrib/103008710854488196421\">Abdul Peña Berlioz</a>",
          "photo_order": 3,
          "created_at": "2025-12-27T01:46:50.000Z",
          "deleted_at": null
        },
        "cityPhoto": null
      },
      {
        "id": "7241448e-092b-44a5-83ce-8bbe64ec6f10",
        "trip_id": "817e87ed-adee-4a16-9c91-de5b6d6b218a",
        "place_photo_id": null,
        "city_photo_id": "9175cb69-fbf4-4964-8e9b-31e5f3b738df",
        "image_order": 0,
        "created_at": "2025-12-27T14:09:31.000Z",
        "deleted_at": null,
        "placePhoto": null,
        "cityPhoto": {
          "url": "http://localhost:3000/images/cities/4852094c-b9d4-431a-a335-02a360bab3d7/0.jpg",
          "id": "9175cb69-fbf4-4964-8e9b-31e5f3b738df",
          "city_id": "4852094c-b9d4-431a-a335-02a360bab3d7",
          "google_photo_reference": "AZLasHq6XrPhJplVf5iIrvdLYWCxwP3_aC0JEOxpHqE0KwiR2O9U2WZ-MMebQKOx1b94TWkwCM36_En9WlFWWdvGqYkgMIP9IxmC9Iz3MubC2leEQ5IdUF7V0kqF6UJdAnBd7d3VDfuoz4-MKFYmTpNWiFlVJNw1-vXD91aOkNhIOhqWkscVPl82e6HPfbT06vgdQNJ1kKO6gjL8-KDdtsPx2hZ3DXaYt4T7S2B-kFClTWrHy3twGJxIDmG5S-UPsP4Dw-cjEY8cWJZKnUlAuN7hfryvoPAcNQIrwAVWxF35jLzTIsmtKs5pMv4gm4LQQdcX1ssmHCAXAqSCSiIH3n3_miTJFZl8MtHg4kSnkV3Ggu8QKOGauhjBL4hUYsrHqi2gheSYQu78MUhxZ2-hgJ7DgDIkpz54SErSkZ9Keh9bn1M",
          "attribution": "<a href=\"https://maps.google.com/maps/contrib/104595769235117236345\">Martin Vorel</a>",
          "photo_order": 0,
          "created_at": "2025-12-27T01:46:57.000Z",
          "deleted_at": null
        }
      },
      {
        "id": "3157eede-229d-4ed5-ac75-c6516c0639d4",
        "trip_id": "817e87ed-adee-4a16-9c91-de5b6d6b218a",
        "place_photo_id": "68a28898-b8c9-4b8b-97ed-efdc71912655",
        "city_photo_id": null,
        "image_order": 1,
        "created_at": "2025-12-27T14:09:31.000Z",
        "deleted_at": null,
        "placePhoto": {
          "url": "http://localhost:3000/images/places/d7491bb9-56af-4f7c-91e6-c0ab56d86ed8/2.jpg",
          "id": "68a28898-b8c9-4b8b-97ed-efdc71912655",
          "place_id": "d7491bb9-56af-4f7c-91e6-c0ab56d86ed8",
          "google_photo_reference": "AZLasHoqRlXjaNG7bSUlXed7oLt_zCWvkGHUqkKL6sodOH0gW1iCna68-SJCCnoX0cAcSoDOUKXSp3yDIiicm3XKupZHBUU9fKoVaK4-HyTjnCQZhzvEczuZTl6ErvV2yz3JEchKSy9lBzfgH0jqJGv1i1f8AZydKtNHyzLCw693WVi1-M3XFmsgjiRtTAmYEjkBuSQRQFn_J196UF5o1kwxTDZgJAbHd3JuQgdSlTVFr7feLpzm6k3PdO8zSpJxJXhJSljMLOPW1PX0Jp4kxU-Hrfnf_ce7pJEX-xs879C8ChThTdCfnRSPgETm_oJfMSjIh40RDWpR3bZtakQqa6DKZChOTpM4W2jgylquqN9tuxNNII5X-QbPTZ_zbZkt5E6viDm5h502zZb7hu3Y9HLNdnwesqJqllWNnNDHuaLl4IICIA",
          "attribution": "<a href=\"https://maps.google.com/maps/contrib/116811206971456147516\">Khalil ibrahim</a>",
          "photo_order": 2,
          "created_at": "2025-12-27T01:46:50.000Z",
          "deleted_at": null
        },
        "cityPhoto": null
      },
      {
        "id": "0e631e91-e25d-445d-a6a0-59ae92c72106",
        "trip_id": "817e87ed-adee-4a16-9c91-de5b6d6b218a",
        "place_photo_id": "22d5fba5-4ee8-4e48-96bc-9605b2e89a44",
        "city_photo_id": null,
        "image_order": 5,
        "created_at": "2025-12-27T14:09:31.000Z",
        "deleted_at": null,
        "placePhoto": {
          "url": "http://localhost:3000/images/places/a2192b69-cb69-48f4-9883-676df63bb417/8.jpg",
          "id": "22d5fba5-4ee8-4e48-96bc-9605b2e89a44",
          "place_id": "a2192b69-cb69-48f4-9883-676df63bb417",
          "google_photo_reference": "AZLasHp3xyD7b7LBeUoT0CrWbqh9GI-e0l9qUJYUPjBYVv1MEuh5rwR7BzzaAHBY3pD5vUw-XFdqSVqqEH-alcsoZQnxiYIMa0m5bradVf8BG-Gyo3-eSSLI5H4vs88247vNYwbcOSbtDlzTKIp7xW9oUn-MPPnoSpzkbP3_trb3FI8OuBgLRVGmy4TTbdwBZe2FcSw9KkxQYU6buBPGxOQx-VvBE4lYzyXGPt3MiM5SnN8NercafpgtKlM7pYvNdi6mJY5TQUtNve7lRf71kfxiyE9fzjZnB2NqVx9CMXwnaUuMStyd8tci6TAHV83GqXUp_PSz11vi1BiaPzlC1tMrfJHHRpqTQfSNRdO-vDXUn6351YbBBh9TEOnkr__8X7vlUvxbqXjug95wl7Qg6-ruCRBEqpEvuQFxVpMkiQajUSZAzqJKdpuOr3eck3XNgsKr",
          "attribution": "<a href=\"https://maps.google.com/maps/contrib/105682422124180061694\">Ryohei Nakatani</a>",
          "photo_order": 8,
          "created_at": "2025-12-27T01:46:50.000Z",
          "deleted_at": null
        },
        "cityPhoto": null
      },
      {
        "id": "e7859f0c-bdb4-4321-a475-fc8d9ed8e55f",
        "trip_id": "817e87ed-adee-4a16-9c91-de5b6d6b218a",
        "place_photo_id": "280bf456-e78f-43b2-b6c5-9ef0ac3ed625",
        "city_photo_id": null,
        "image_order": 4,
        "created_at": "2025-12-27T14:09:31.000Z",
        "deleted_at": null,
        "placePhoto": {
          "url": "http://localhost:3000/images/places/d7491bb9-56af-4f7c-91e6-c0ab56d86ed8/7.jpg",
          "id": "280bf456-e78f-43b2-b6c5-9ef0ac3ed625",
          "place_id": "d7491bb9-56af-4f7c-91e6-c0ab56d86ed8",
          "google_photo_reference": "AZLasHqyzqb5FwNQAjVFvDbQsz6mQ4cJN78dRPIvRvjndYS6DgDUbI8WrhJSmlY-RjNyzVXNEG6dFOmbT2x347qt9aRmaFkgCBu2_l4jF8kpgvHzQSN8xQ8SHi3C9PkdgCUTuX3asWV62f8TU_67UaG1HH6bLKKHiIJnMNjxAp5xc3NgmBvvzA7HGO_FBXfbxn1wA0cbj1CkbL28e-I_ftgetvIETAkM1rbBTBAMkkMApu6drFi4JPywaJn_SkEyxe9GPZiYzjOcwTRpj0u0LiftVZ97t1S0l5eKTex1y7e016xxvMMyJCu1Zb1GEOUuQcIAVrKd9zGkbbg9WH5rHxkjm9cVRoatJj2TJxS_eUo7xiQx07MQJ1n5hItXQbP8p_nYn0-nn7Osb6zT-ab9s8lnT6qft8LQ2_iWBsYidMt4popkAEpc",
          "attribution": "<a href=\"https://maps.google.com/maps/contrib/106629067552762884267\">Fernando Rodriguez</a>",
          "photo_order": 7,
          "created_at": "2025-12-27T01:46:50.000Z",
          "deleted_at": null
        },
        "cityPhoto": null
      },
      {
        "id": "ceff78f1-4cc8-444b-a9ce-33f5551b49c3",
        "trip_id": "817e87ed-adee-4a16-9c91-de5b6d6b218a",
        "place_photo_id": "6528dbd0-4b29-483c-9f7e-65b3175523f3",
        "city_photo_id": null,
        "image_order": 3,
        "created_at": "2025-12-27T14:09:31.000Z",
        "deleted_at": null,
        "placePhoto": {
          "url": "http://localhost:3000/images/places/a2192b69-cb69-48f4-9883-676df63bb417/4.jpg",
          "id": "6528dbd0-4b29-483c-9f7e-65b3175523f3",
          "place_id": "a2192b69-cb69-48f4-9883-676df63bb417",
          "google_photo_reference": "AZLasHoTBoGufWftGlcKBIs90x-d-3Zde5UEOCktxXT2DuqAK5K-EmHgYDb9wW4paf47psoulpXSxMuAv2Vkz2jYmY97N1tdAA1cNidn7nqMq7pwmENyHXelyFGmvtkjfQP9rhFALrqebAh2V7STSZ0wUesD61W3I-R5q-m-dA_maxOA8eFmyWXv4OoThZkAlQ8ULhQuA76z5gM2amX6CjQhSOSVc-u4Zq7Nb9zFe75IVI9pV_9bQTLbPLFQn5eXrqu9qSAXvyrk74EkZT0BQjFiCR41N6UsMF3PtJsOyw0U99brlWoSKOXoXOtMVmz6MyOUlc8sz6w0YSXips7zjmgP35lGQAhDp-mCpA38BlLjANlj2JwUIyUkFFNh0F8UW8nPLzjEV7Yh7P851wCCXfh9DsBgWsmgNNSiDhMPeQUFgKfO1sYq",
          "attribution": "<a href=\"https://maps.google.com/maps/contrib/116784712320591205578\">mina</a>",
          "photo_order": 4,
          "created_at": "2025-12-27T01:46:49.000Z",
          "deleted_at": null
        },
        "cityPhoto": null
      }
    ]
  }
];

    // Helper to find or create user
    const findOrCreateUser = async (userData) => {
      if (!userData) return null;

      const [user] = await queryInterface.bulkInsert('users', [{
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        preferred_name: userData.preferred_name,
        photo_url: userData.photo_url,
        bio: userData.bio,
        created_at: new Date(),
        updated_at: new Date(),
      }], {
        updateOnDuplicate: ['full_name', 'preferred_name', 'photo_url', 'bio', 'updated_at'],
        returning: true
      });

      return user;
    };

    // Helper to find or create country
    const findOrCreateCountry = async (countryData) => {
      if (!countryData) return null;

      const [country] = await queryInterface.bulkInsert('countries', [{
        id: countryData.id,
        name: countryData.name,
        code: countryData.code,
        created_at: new Date(),
        updated_at: new Date(),
      }], {
        updateOnDuplicate: ['name', 'code', 'updated_at'],
        returning: true
      });

      return country;
    };

    // Helper to find or create city
    const findOrCreateCity = async (cityData) => {
      if (!cityData) return null;

      let countryId = null;
      if (cityData.country) {
        const country = await findOrCreateCountry(cityData.country);
        countryId = country ? country.id : cityData.country.id;
      }

      const [city] = await queryInterface.bulkInsert('cities', [{
        id: cityData.id,
        name: cityData.name,
        country_id: countryId,
        latitude: cityData.latitude,
        longitude: cityData.longitude,
        created_at: new Date(),
        updated_at: new Date(),
      }], {
        updateOnDuplicate: ['name', 'country_id', 'latitude', 'longitude', 'updated_at'],
        returning: true
      });

      // Insert city photos
      if (cityData.photos && cityData.photos.length > 0) {
        await queryInterface.bulkInsert('city_photos',
          cityData.photos.map(photo => ({
            id: photo.id,
            city_id: cityData.id,
            url: photo.url,
            photo_order: photo.photo_order || 0,
            created_at: new Date(),
          })),
          { ignoreDuplicates: true }
        );
      }

      return city;
    };

    // Helper to find or create place
    const findOrCreatePlace = async (placeData) => {
      if (!placeData) return null;

      const [place] = await queryInterface.bulkInsert('places', [{
        id: placeData.id,
        google_place_id: placeData.google_place_id,
        name: placeData.name,
        address: placeData.address,
        latitude: placeData.latitude,
        longitude: placeData.longitude,
        rating: placeData.rating,
        user_ratings_total: placeData.user_ratings_total,
        price_level: placeData.price_level,
        types: JSON.stringify(placeData.types || []),
        city_id: placeData.city_id,
        created_at: new Date(),
        updated_at: new Date(),
      }], {
        updateOnDuplicate: ['name', 'address', 'rating', 'user_ratings_total', 'updated_at'],
        returning: true
      });

      // Insert place photos
      if (placeData.photos && placeData.photos.length > 0) {
        await queryInterface.bulkInsert('place_photos',
          placeData.photos.map(photo => ({
            id: photo.id,
            place_id: placeData.id,
            url: photo.url,
            photo_order: photo.photo_order || 0,
            created_at: new Date(),
          })),
          { ignoreDuplicates: true }
        );
      }

      return place;
    };

    // Process each trip
    for (const tripData of tripsData) {
      console.log(`Processing trip: ${tripData.title}`);

      // Create/update author
      if (tripData.author) {
        await findOrCreateUser(tripData.author);
      }

      // Create/update cities
      if (tripData.cities && tripData.cities.length > 0) {
        for (const city of tripData.cities) {
          await findOrCreateCity(city);
        }
      }

      // Create/update places
      if (tripData.places && tripData.places.length > 0) {
        for (const tripPlace of tripData.places) {
          if (tripPlace.place) {
            await findOrCreatePlace(tripPlace.place);
          }
        }
      }

      // Create trip
      await queryInterface.bulkInsert('trips', [{
        id: tripData.id,
        author_id: tripData.author_id,
        title: tripData.title,
        description: tripData.description,
        destination: tripData.destination,
        destination_lat: tripData.destination_lat,
        destination_lng: tripData.destination_lng,
        duration: tripData.duration,
        budget: tripData.budget,
        transportation: tripData.transportation,
        accommodation: tripData.accommodation,
        best_time_to_visit: tripData.best_time_to_visit,
        difficulty_level: tripData.difficulty_level,
        trip_type: tripData.trip_type,
        is_public: tripData.is_public,
        is_featured: tripData.is_featured,
        is_draft: tripData.is_draft,
        likes_count: tripData.likes_count || 0,
        views_count: tripData.views_count || 0,
        created_at: new Date(tripData.created_at),
        updated_at: new Date(tripData.updated_at),
      }], { ignoreDuplicates: true });

      // Create trip-city associations
      if (tripData.cities && tripData.cities.length > 0) {
        await queryInterface.bulkInsert('trip_cities',
          tripData.cities.map(city => ({
            trip_id: tripData.id,
            city_id: city.id,
            city_order: city.trip_cities?.city_order || city.Cities?.city_order || 0,
            created_at: new Date(),
          })),
          { ignoreDuplicates: true }
        );
      }

      // Create tags
      if (tripData.tags && tripData.tags.length > 0) {
        await queryInterface.bulkInsert('trip_tags',
          tripData.tags.map(tag => ({
            id: tag.id,
            trip_id: tripData.id,
            tag: tag.tag,
            created_at: new Date(),
          })),
          { ignoreDuplicates: true }
        );
      }

      // Create trip places
      if (tripData.places && tripData.places.length > 0) {
        await queryInterface.bulkInsert('trip_places',
          tripData.places.map(tp => ({
            id: tp.id,
            trip_id: tripData.id,
            place_id: tp.place_id,
            name: tp.name,
            address: tp.address,
            rating: tp.rating,
            price_level: tp.price_level,
            types: JSON.stringify(tp.types || []),
            description: tp.description,
            created_at: new Date(tp.created_at),
          })),
          { ignoreDuplicates: true }
        );
      }

      // Create itinerary days
      if (tripData.itineraryDays && tripData.itineraryDays.length > 0) {
        for (const day of tripData.itineraryDays) {
          await queryInterface.bulkInsert('trip_itinerary_days', [{
            id: day.id,
            trip_id: tripData.id,
            city_id: day.city_id,
            day_number: day.day_number,
            title: day.title,
            description: day.description,
            created_at: new Date(day.created_at),
          }], { ignoreDuplicates: true });

          // Create activities
          if (day.activities && day.activities.length > 0) {
            await queryInterface.bulkInsert('trip_itinerary_activities',
              day.activities.map(activity => ({
                id: activity.id,
                itinerary_day_id: day.id,
                time: activity.time,
                name: activity.name,
                location: activity.location,
                description: activity.description,
                activity_order: activity.activity_order,
                place_id: activity.place_id,
                created_at: new Date(activity.created_at),
              })),
              { ignoreDuplicates: true }
            );
          }
        }
      }

      // Create trip images
      if (tripData.images && tripData.images.length > 0) {
        await queryInterface.bulkInsert('trip_images',
          tripData.images.map(img => ({
            id: img.id,
            trip_id: tripData.id,
            place_photo_id: img.place_photo_id,
            city_photo_id: img.city_photo_id,
            image_order: img.image_order,
            created_at: new Date(img.created_at),
          })),
          { ignoreDuplicates: true }
        );
      }
    }

    console.log('Seeder completed successfully!');
  },

  down: async (queryInterface, Sequelize) => {
    // Remove seeded trips
    const tripIds = ["e6693b4f-9ef7-488a-835d-2cd8d9e015d9","817e87ed-adee-4a16-9c91-de5b6d6b218a"];

    await queryInterface.bulkDelete('trip_images', { trip_id: tripIds });
    await queryInterface.bulkDelete('trip_itinerary_activities', null);
    await queryInterface.bulkDelete('trip_itinerary_days', { trip_id: tripIds });
    await queryInterface.bulkDelete('trip_places', { trip_id: tripIds });
    await queryInterface.bulkDelete('trip_tags', { trip_id: tripIds });
    await queryInterface.bulkDelete('trip_cities', { trip_id: tripIds });
    await queryInterface.bulkDelete('trips', { id: tripIds });
  }
};
