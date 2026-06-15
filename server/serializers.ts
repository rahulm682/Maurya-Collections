export function toFirestoreDocument(obj: any): any {
  const fields: any = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined || val === null) continue;
    if (typeof val === 'string') {
      fields[key] = { stringValue: val };
    } else if (typeof val === 'number') {
      if (Number.isInteger(val)) {
        fields[key] = { integerValue: String(val) };
      } else {
        fields[key] = { doubleValue: val };
      }
    } else if (typeof val === 'boolean') {
      fields[key] = { booleanValue: val };
    } else if (Array.isArray(val)) {
      fields[key] = {
        arrayValue: {
          values: val.map(item => ({ stringValue: String(item) }))
        }
      };
    }
  }
  return { fields };
}

export function fromFirestoreDocument(doc: any): any {
  if (!doc.fields) return {};
  const obj: any = {};
  for (const [key, descriptor] of Object.entries(doc.fields) as [string, any][]) {
    if ('stringValue' in descriptor) {
      obj[key] = descriptor.stringValue;
    } else if ('integerValue' in descriptor) {
      obj[key] = parseInt(descriptor.integerValue, 10);
    } else if ('doubleValue' in descriptor) {
      obj[key] = parseFloat(descriptor.doubleValue);
    } else if ('booleanValue' in descriptor) {
      obj[key] = descriptor.booleanValue;
    } else if ('arrayValue' in descriptor) {
      const values = descriptor.arrayValue.values || [];
      obj[key] = values.map((v: any) => v.stringValue ?? v.integerValue ?? v.doubleValue ?? v.booleanValue ?? '');
    }
  }
  if (doc.name && !obj.id) {
    const parts = doc.name.split('/');
    obj.id = parts[parts.length - 1];
  }
  return obj;
}
