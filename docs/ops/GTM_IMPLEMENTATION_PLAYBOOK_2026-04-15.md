# GTM Implementation Playbook (2026-04-15)

Container: `GTM-N8WC6H89`  
GA4: `G-HR37C4FPQD`  
Meta Pixel: `978667631249072`

## 1) Data Layer events already available on site

`page_view`, `cta_click`, `nav_click`

Each event payload includes:

- `page`
- `title`
- `referrer`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_term`
- `utm_content`
- `gclid`
- `fbclid`

Extra fields:

- `cta_click`: `cta_text`, `cta_href`, `cta_area`
- `nav_click`: `nav_text`, `nav_href`

## 2) GTM Variables (Data Layer Variable)

Create DLV variables:

- `dlv_page` -> `page`
- `dlv_title` -> `title`
- `dlv_referrer` -> `referrer`
- `dlv_utm_source` -> `utm_source`
- `dlv_utm_medium` -> `utm_medium`
- `dlv_utm_campaign` -> `utm_campaign`
- `dlv_utm_term` -> `utm_term`
- `dlv_utm_content` -> `utm_content`
- `dlv_gclid` -> `gclid`
- `dlv_fbclid` -> `fbclid`
- `dlv_cta_text` -> `cta_text`
- `dlv_cta_href` -> `cta_href`
- `dlv_cta_area` -> `cta_area`
- `dlv_nav_text` -> `nav_text`
- `dlv_nav_href` -> `nav_href`

## 3) GTM Triggers (Custom Event)

- Trigger: `CE_page_view` -> event name `page_view`
- Trigger: `CE_cta_click` -> event name `cta_click`
- Trigger: `CE_nav_click` -> event name `nav_click`

## 4) GA4 in GTM

1. Tag: `GA4_Config_Recrutaria`
- Type: Google Tag (GA4)
- Measurement ID: `G-HR37C4FPQD`
- Trigger: Initialization - All Pages

2. Tag: `GA4_Event_page_view`
- Type: GA4 Event
- Event Name: `page_view`
- Parameters:
  - `page`: `{{dlv_page}}`
  - `title`: `{{dlv_title}}`
  - `referrer`: `{{dlv_referrer}}`
  - `utm_source`: `{{dlv_utm_source}}`
  - `utm_medium`: `{{dlv_utm_medium}}`
  - `utm_campaign`: `{{dlv_utm_campaign}}`
  - `utm_term`: `{{dlv_utm_term}}`
  - `utm_content`: `{{dlv_utm_content}}`
  - `gclid`: `{{dlv_gclid}}`
  - `fbclid`: `{{dlv_fbclid}}`
- Trigger: `CE_page_view`

3. Tag: `GA4_Event_cta_click`
- Type: GA4 Event
- Event Name: `cta_click`
- Parameters: all context above +:
  - `cta_text`: `{{dlv_cta_text}}`
  - `cta_href`: `{{dlv_cta_href}}`
  - `cta_area`: `{{dlv_cta_area}}`
- Trigger: `CE_cta_click`

4. Tag: `GA4_Event_nav_click`
- Type: GA4 Event
- Event Name: `nav_click`
- Parameters: all context above +:
  - `nav_text`: `{{dlv_nav_text}}`
  - `nav_href`: `{{dlv_nav_href}}`
- Trigger: `CE_nav_click`

## 5) Meta Pixel in GTM

1. Tag: `Meta_Base_Pixel_Recrutaria` (Custom HTML, Initialization - All Pages)

```html
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '978667631249072');
</script>
```

2. Tag: `Meta_Event_page_view` (Custom HTML)

```html
<script>
fbq('track', 'PageView');
fbq('trackCustom', 'page_view', {
  page: '{{dlv_page}}',
  title: '{{dlv_title}}',
  utm_source: '{{dlv_utm_source}}',
  utm_medium: '{{dlv_utm_medium}}',
  utm_campaign: '{{dlv_utm_campaign}}'
});
</script>
```

Trigger: `CE_page_view`

3. Tag: `Meta_Event_cta_click` (Custom HTML)

```html
<script>
fbq('trackCustom', 'cta_click', {
  page: '{{dlv_page}}',
  cta_text: '{{dlv_cta_text}}',
  cta_href: '{{dlv_cta_href}}',
  cta_area: '{{dlv_cta_area}}',
  utm_source: '{{dlv_utm_source}}',
  utm_medium: '{{dlv_utm_medium}}',
  utm_campaign: '{{dlv_utm_campaign}}'
});
</script>
```

Trigger: `CE_cta_click`

## 6) QA checklist (Preview mode)

1. Open GTM Preview and connect to `https://recrutaria.com.br`.
2. Confirm `page_view` appears once per load.
3. Click CTA buttons and confirm `cta_click`.
4. Click nav links and confirm `nav_click`.
5. Confirm GA4 tags fire only once per event.
6. Confirm Meta tags fire only once per event.
7. Publish container version with note: `funnel events v1`.

