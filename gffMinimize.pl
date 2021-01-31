
#!/usr/bin/perl

use warnings;
use Getopt::Long;
use POSIX;

my $options = {};
my $command_line = join(" ", ('gffTranslate.pl', @ARGV));
GetOptions($options, 'gff|g=s','output|o=s');

my $fi = $options->{'gff'};
my $fo = $options->{'output'};

open( INFILE, "< $fi" ) or die "Cannot open GFF3 file: $fi\n";
open( OUTFILE, "> $fo" ) or die "Cannot open GFF3 file: $fo\n";
my $dnaSequence="";


while (defined($line = <INFILE>)){
    chomp($line);
     @lineArray = split("\t",$line);
     
     $lineArray[0] = substr($lineArray[0],1);


    if($lineArray[2] eq 'gene'){
        $outLine = join("\t",@lineArray);
        print OUTFILE "$outLine \n"; 
    }

}
close INFILE;
close OUTFILE;

