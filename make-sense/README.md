## 💻 Local Setup

```bash
# clone repository
git clone ...

# navigate to main dir
cd make-sense

# install dependencies
npm install

# serve with hot reload at localhost:3000
npm start
```
To ensure proper functionality of the application locally, an npm `6.x.x` and node.js `v12.x.x` versions are required. More information about this problem is available in the [#16][4].

## 🐳 Docker Setup

```bash
# Build Docker Image
docker build -t make_sense docker/

# Run Docker Image as Service
docker run -dit -p 3000:3000 --restart=always --name=make_sense make_sense

# Get Docker Container IP
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' make_sense
# Go to `<DOCKER_CONTAINER_IP>:3000`

# Get Docker Container Logs
docker logs make_sense
```

## ⌨️ Keyboard Shortcuts

| Functionality                      | Context  | Mac | Windows / Linux  |
|:-----------------------------------|:--------:|:---:|:----------------:|
| Polygon autocomplete               | Editor   | <kbd>Enter</kbd> | <kbd>Enter</kbd> |
| Cancel polygon drawing             | Editor   | <kbd>Escape</kbd> | <kbd>Escape</kbd> |
| Delete currently selected label    | Editor   | <kbd>Backspace</kbd> | <kbd>Delete</kbd> |
| Load previous image                | Editor   | <kbd>⌥</kbd> + <kbd>Left</kbd> | <kbd>Ctrl</kbd> + <kbd>Left</kbd> |
| Load next image                    | Editor   | <kbd>⌥</kbd> + <kbd>Right</kbd> | <kbd>Ctrl</kbd> + <kbd>Right</kbd> |
| Zoom in                            | Editor   | <kbd>⌥</kbd> + <kbd>+</kbd> | <kbd>Ctrl</kbd> + <kbd>+</kbd> |
| Zoom out                           | Editor   | <kbd>⌥</kbd> + <kbd>-</kbd> | <kbd>Ctrl</kbd> + <kbd>-</kbd> |
| Move image                         | Editor   | <kbd>Up</kbd> / <kbd>Down</kbd> / <kbd>Left</kbd> / <kbd>Right</kbd> | <kbd>Up</kbd> / <kbd>Down</kbd> / <kbd>Left</kbd> / <kbd>Right</kbd> |
| Select Label                       | Editor   | <kbd>⌥</kbd> + <kbd>0-9</kbd> | <kbd>Ctrl</kbd> + <kbd>0-9</kbd> |
| Exit popup                         | Popup    | <kbd>Escape</kbd> | <kbd>Escape</kbd> |

**Table 1.** Supported keyboard shortcuts

## ⬆️ Export Formats

|               | CSV | YOLO | VOC XML | VGG JSON | COCO JSON | PIXEL MASK |
|:-------------:|:---:|:----:|:-------:|:--------:|:---------:|:----------:|
| **Point**     | ✓   | ✗    | ☐       | ☐        | ☐         | ✗          |
| **Line**      | ✓   | ✗    | ✗       | ✗        | ✗         | ✗          |
| **Rect**      | ✓   | ✓    | ✓       | ☐        | ☐         | ✗          |
| **Polygon**   | ☐   | ✗    | ☐       | ✓        | ✓         | ☐          |
| **Label**     | ✓   | ✗    | ✗       | ✗        | ✗         | ✗          |

**Table 2.** The matrix of supported labels export formats, where:
* ✓ - supported format
* ☐ - not yet supported format
* ✗ - format does not make sense for a given label type  

You can find examples of export files along with a description and schema on our [Wiki][7].

## ⬇️ Import Formats

|               | CSV | YOLO | VOC XML | VGG JSON | COCO JSON | PIXEL MASK |
|:-------------:|:---:|:----:|:-------:|:--------:|:---------:|:----------:|
| **Point**     | ☐   | ✗    | ☐       | ☐        | ☐         | ✗          |
| **Line**      | ☐   | ✗    | ✗       | ✗        | ✗         | ✗          |
| **Rect**      | ☐   | ✓    | ☐       | ☐        | ✓         | ✗          |
| **Polygon**   | ☐   | ✗    | ☐       | ☐        | ✓         | ☐          |
| **Label**     | ☐   | ✗    | ✗       | ✗        | ✗         | ✗          |

**Table 3.** The matrix of supported labels import formats

## 🔐 Privacy

We don't store your images, because we don't send them anywhere in the first place.