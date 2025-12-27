# Add this to your index.html head to configure react scan (slows down development page loading time but lets you debug react issues visually - also requires configuration in the vite config)

```html
<script>
  const didInit = localStorage.getItem('init-dev');

  if (!didInit) {
    localStorage.setItem('react' + '-scan-notifications-audio', 'false');
    localStorage.setItem('react' + '-scan-options', JSON.stringify({
      "enabled": false,
      "log": false,
      "showToolbar": true,
      "animationSpeed": "off",
      "dangerouslyForceRunInProduction": false,
      "showFPS": true,
      "showNotificationCount": true,
      "allowInIframe": false
    }));
    localStorage.setItem('react' + '-scan-widget-collapsed-v1', JSON.stringify({
      "corner": "bottom-left",
      "orientation": "horizontal"
    }));
    localStorage.setItem('react' + '-scan-widget-settings-v2', JSON.stringify({
      "corner": "bottom-left",
      "dimensions": {
        "isFullWidth": false,
        "isFullHeight": false,
        "width": 189,
        "height": 36,
        "position": {
          "x": 24,
          "y": 24
        }
      },
      "lastDimensions": {
        "isFullWidth": false,
        "isFullHeight": false,
        "width": 189,
        "height": 36,
        "position": {
          "x": 24,
          "y": 890
        }
      },
      "componentsTree": {
        "width": 240
      }
    }));
    localStorage.setItem('init-dev', true);
  }
</script>
```
