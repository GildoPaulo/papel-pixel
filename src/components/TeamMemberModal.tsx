import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { X, Mail, Phone, MapPin, Linkedin, Briefcase, GraduationCap, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  email?: string;
  phone?: string;
  location?: string;
  experience?: string;
  education?: string;
  achievements?: string[];
  skills?: string[];
}

interface TeamMemberModalProps {
  member: TeamMember;
  isOpen: boolean;
  onClose: () => void;
}

const TeamMemberModal = ({ member, isOpen, onClose }: TeamMemberModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading">{member.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header com foto e informações principais */}
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-hero rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-3xl text-white font-bold">
                {member.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-heading font-bold mb-2">{member.name}</h3>
              <p className="text-primary font-semibold mb-4">{member.role}</p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {member.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{member.email}</span>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{member.phone}</span>
                  </div>
                )}
                {member.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{member.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          <Card>
            <CardContent className="p-4">
              <p className="text-muted-foreground leading-relaxed">{member.bio}</p>
            </CardContent>
          </Card>

          {/* Experiência */}
          {member.experience && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Experiência Profissional</h4>
                </div>
                <p className="text-muted-foreground whitespace-pre-line">{member.experience}</p>
              </CardContent>
            </Card>
          )}

          {/* Educação */}
          {member.education && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Formação Acadêmica</h4>
                </div>
                <p className="text-muted-foreground whitespace-pre-line">{member.education}</p>
              </CardContent>
            </Card>
          )}

          {/* Habilidades */}
          {member.skills && member.skills.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Competências</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {member.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conquistas */}
          {member.achievements && member.achievements.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Realizações</h4>
                </div>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {member.achievements.map((achievement, index) => (
                    <li key={index}>{achievement}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamMemberModal;

