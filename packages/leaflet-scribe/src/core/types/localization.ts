export interface PrecisionOptions {
  km?: number | undefined
  ha?: number | undefined
  m?: number | undefined
  mi?: number | undefined
  ac?: number | undefined
  yd?: number | undefined
  ft?: number | undefined
  nm?: number | undefined
}

export interface DrawLocalAction {
  title: string
  text: string
}

export interface DrawLocalTooltip {
  start?: string | undefined
  cont?: string | undefined
  end?: string | undefined
}

export interface DrawLocalDrawToolbar {
  actions: DrawLocalAction
  finish: DrawLocalAction
  undo: DrawLocalAction
  buttons: {
    polyline: string
    polygon: string
    rectangle: string
    circle: string
    marker: string
    circlemarker: string
  }
}

export interface DrawLocalDrawHandlers {
  circle: {
    tooltip: {
      start: string
    }
    radius: string
  }
  circlemarker: {
    tooltip: {
      start: string
    }
  }
  marker: {
    tooltip: {
      start: string
    }
  }
  polygon: {
    tooltip: {
      start: string
      cont: string
      end: string
    }
  }
  polyline: {
    error: string
    tooltip: {
      start: string
      cont: string
      end: string
    }
  }
  rectangle: {
    tooltip: {
      start: string
    }
  }
  simpleshape: {
    tooltip: {
      end: string
    }
  }
}

export interface DrawLocalEditToolbar {
  actions: {
    save: DrawLocalAction
    cancel: DrawLocalAction
    clearAll: DrawLocalAction
  }
  buttons: {
    edit: string
    editDisabled: string
    remove: string
    removeDisabled: string
  }
}

export interface DrawLocalEditHandlers {
  edit: {
    tooltip: {
      text: string
      subtext: string
    }
  }
  remove: {
    tooltip: {
      text: string
    }
  }
}

export interface DrawLocalNumericFormat {
  delimiters?: {
    thousands?: string | undefined
    decimal?: string | undefined
  }
}

export interface DrawLocalFormat {
  numeric?: DrawLocalNumericFormat | undefined
}

export interface DrawLocal {
  format?: DrawLocalFormat | undefined
  draw: {
    toolbar: DrawLocalDrawToolbar
    handlers: DrawLocalDrawHandlers
  }
  edit: {
    toolbar: DrawLocalEditToolbar
    handlers: DrawLocalEditHandlers
  }
}

