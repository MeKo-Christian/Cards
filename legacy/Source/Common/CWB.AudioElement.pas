unit CWB.AudioElement;

interface

uses
  W3C.DOM, W3C.HTML5, W3C.WebAudio, CWB.Element;

type
  TAudioElement = class(THtmlElement)
  protected
    class function ElementName: String; override;
  public
    constructor Create(Owner: IHtmlElementOwner); overload; override;

    property AudioElement: JHTMLAudioElement read (JHTMLAudioElement(Element));
  end;

var
  GAudioContext external 'AudioContext' : JAudioContext;

implementation

{ TAudioElement }

constructor TAudioElement.Create(Owner: IHtmlElementOwner);
begin
  inherited Create(Owner);
end;

class function TAudioElement.ElementName: String;
begin
  Result := 'audio';
end;

initialization
  asm
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    @GAudioContext = new AudioContext();
  end;

end.