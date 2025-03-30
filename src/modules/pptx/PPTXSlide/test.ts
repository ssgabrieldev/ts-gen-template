import { PPTXSlide } from ".";
import { DOMParser, XMLSerializer } from "xmldom";
import { PPTXTemplateFile } from "../PPTXTemplateFile";

describe("Slide", () => {
  const serializer = new XMLSerializer();
  const parser = new DOMParser();

  it("should load all placeholders", async () => {
    const parentNode = parser.parseFromString(`
      <slide>
        <p:txBody>
          <a:p>
            <a:r>
              <a:t>{#items}</a:t>
            </a:r>
          </a:p>
          <a:p>
            <a:r>
              <a:t>{#names}</a:t>
            </a:r>
          </a:p>
          <a:p>
            <a:r>
              <a:t>{name}</a:t>
            </a:r>
          </a:p>
          <a:p>
            <a:r>
              <a:t>{/names}</a:t>
            </a:r>
          </a:p>
          <a:p>
            <a:r>
              <a:t>{/items}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </slide>
    `);
    const paragraphElements = parentNode.getElementsByTagName("a:p");
    const openItemsNode = paragraphElements[0];
    const openNamesNode = paragraphElements[1];
    const nameNode = paragraphElements[2];
    const closeNamesNode = paragraphElements[3];
    const closeItemsNode = paragraphElements[4];
    const slide = new PPTXSlide({
      number: 1,
      templateFile: {} as PPTXTemplateFile
    });

    slide.setXMLDocument(parentNode);
    const [placeholders, error] = await slide.getPlaceholders();

    expect(error).toBe(null);

    if (placeholders) {
      expect(placeholders.length).toBe(1);

      const [itemsPlaceholder] = placeholders;
      expect(itemsPlaceholder).toBeTruthy();

      if (itemsPlaceholder) {
        expect(itemsPlaceholder.getKey()).toBe("items");
        expect(serializer.serializeToString(itemsPlaceholder.getNode()))
          .toBe(serializer.serializeToString(openItemsNode));
        expect(serializer.serializeToString(itemsPlaceholder.getCloseNode()!))
          .toBe(serializer.serializeToString(closeItemsNode));
        expect(itemsPlaceholder.getNext()).toBe(null);
        expect(itemsPlaceholder.getPrev()).toBe(null);
        expect(itemsPlaceholder.getParent()).toBe(null);

        const namesPlaceholder = itemsPlaceholder.getFirstChild();
        expect(namesPlaceholder).toBeTruthy();

        if (namesPlaceholder) {
          expect(namesPlaceholder.getKey()).toBe("names");
          expect(serializer.serializeToString(namesPlaceholder.getNode()))
            .toBe(serializer.serializeToString(openNamesNode));
          expect(serializer.serializeToString(namesPlaceholder.getCloseNode()!))
            .toBe(serializer.serializeToString(closeNamesNode));
          expect(namesPlaceholder.getNext()).toBe(null);
          expect(namesPlaceholder.getPrev()).toBe(null);
          expect(namesPlaceholder.getParent()).toBe(itemsPlaceholder);

          const namePlaceholder = namesPlaceholder.getFirstChild();
          expect(namePlaceholder).toBeTruthy();

          if (namePlaceholder) {
            expect(namePlaceholder.getKey()).toBe("name");
            expect(serializer.serializeToString(namePlaceholder.getNode()))
              .toBe(serializer.serializeToString(nameNode));
            expect(namePlaceholder.getCloseNode()).toBe(null);
            expect(namePlaceholder.getNext()).toBe(null);
            expect(namePlaceholder.getPrev()).toBe(null);
            expect(namePlaceholder.getParent()).toBe(namesPlaceholder);
          }
        }
      }
    }
  });
});
