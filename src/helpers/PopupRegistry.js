let popupRefs = [];

export function getPopupRefs() {
  popupRefs = popupRefs.filter((p) => p && !p.closed);
  return popupRefs;
}

export function setPopupRefs(popups) {
  popupRefs = (popups || []).filter((p) => p && !p.closed);
  return popupRefs;
}
